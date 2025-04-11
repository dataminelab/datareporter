"""Fix data_source_id on reports

Revision ID: 9f4a3f20c1d2
Revises: db238f81a5aa
Create Date: 2025-04-11
"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers
revision = "9f4a3f20c1d2"
down_revision = "db238f81a5aa"
branch_labels = None
depends_on = None


def upgrade():
    # Add the column if it doesn't exist (skip in this case)
    # Fix foreign key (drop and recreate just the FK, not the column)
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("reports_data_source_id_fkey", type_="foreignkey", if_exists=True)
        batch_op.create_foreign_key("reports_data_source_id_fkey", "data_sources", ["data_source_id"], ["id"])

    # Pick a random existing data_sources.id to use as fallback
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT id FROM data_sources ORDER BY RANDOM() LIMIT 1"))
    fallback_id = result.scalar() or 1  # default to 1 if no row exists

    # Update NULL data_source_id values
    conn.execute(sa.text(f"UPDATE reports SET data_source_id = {fallback_id} WHERE data_source_id IS NULL"))


def downgrade():
    # Just drop the foreign key (leave column)
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("reports_data_source_id_fkey", type_="foreignkey")
