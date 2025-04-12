"""Add data_source_id column to reports and populate it

Revision ID: 9f4a3f20c1d2
Revises: db238f81a5aa
Create Date: 2025-04-11
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9f4a3f20c1d2'
down_revision = 'db238f81a5aa'
branch_labels = None
depends_on = None


def upgrade():
    # Try to add the column only if it doesn't exist
    conn = op.get_bind()

    # Check if the column already exists
    result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='reports' AND column_name='data_source_id'
    """))

    if not result.first():
        # Add the column
        with op.batch_alter_table("reports") as batch_op:
            batch_op.add_column(sa.Column("data_source_id", sa.Integer(), nullable=True))

    # Add or replace foreign key
    with op.batch_alter_table("reports") as batch_op:
        # Drop old FK if exists (ignore errors)
        try:
            batch_op.create_foreign_key(
                "reports_data_source_id_fkey",
                "data_sources",
                ["data_source_id"],
                ["id"],
                ondelete="SET NULL"
            )
        except Exception:
            pass

    conn.execute(sa.text("""
        UPDATE reports SET data_source_id = 1 WHERE 1=1
    """))


def downgrade():
    # Just drop the foreign key and column (optional)
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("reports_data_source_id_fkey", type_="foreignkey")
        batch_op.drop_column("data_source_id")
