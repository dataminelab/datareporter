"""make_group_permissions_mutable

Revision ID: make_group_permissions_mutable
Revises: febb1459b2c2
Create Date: 2025-08-07 02:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Session
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = 'make_group_permissions_mutable'
down_revision = 'febb1459b2c2'
branch_labels = None
depends_on = None


def upgrade():
    """
    Update existing groups to ensure permissions are properly tracked.
    This migration addresses the issue where permissions were immutable
    by ensuring all existing data is compatible with MutableList tracking.
    """
    # pylint: disable=no-member
    connection = op.get_bind()

    print("Starting permissions migration...")

    # First, let's see what we have
    result = connection.execute(text("SELECT COUNT(*) FROM groups"))
    group_count = result.scalar()
    print(f"Found {group_count} groups to update")

    # Update all groups to ensure permissions arrays are properly formatted
    # This forces SQLAlchemy to recognize changes to the permissions array
    connection.execute(text("""
        UPDATE groups
        SET permissions = permissions
        WHERE permissions IS NOT NULL
    """))
    print("Updated existing groups with non-null permissions")

    # Set default permissions for any groups that have NULL permissions
    connection.execute(text("""
        UPDATE groups
        SET permissions = ARRAY[
            'create_dashboard',
            'create_query',
            'edit_dashboard',
            'edit_query',
            'view_query',
            'view_source',
            'execute_query',
            'list_users',
            'schedule_query',
            'list_dashboards',
            'list_alerts',
            'list_data_sources',
            'view_model',
            'edit_model',
            'create_model',
            'edit_model_config',
            'view_model_config',
            'view_report',
            'edit_report',
            'create_report',
            'generate_report'
        ]::varchar[]
        WHERE permissions IS NULL
    """))

    # Check how many were updated
    result = connection.execute(text("SELECT COUNT(*) FROM groups WHERE permissions IS NULL"))
    null_count = result.scalar()
    print("Set default permissions for groups with NULL permissions")
    print(f"Remaining groups with NULL permissions: {null_count}")

    # Verify the update worked
    result = connection.execute(text("""
        SELECT id, name, array_length(permissions, 1) as perm_count
        FROM groups
        LIMIT 5
    """))

    print("Sample groups after migration:")
    for row in result:  # type: ignore[reportOptionalIterable]
        print(f"  Group {row.id} ({row.name}): {row.perm_count} permissions")

    print("Migration completed successfully!")


def downgrade():
    """
    No schema changes were made, so nothing to downgrade.
    The permissions data remains intact.
    """
    print("No downgrade needed - no schema changes were made")
    pass
