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
    conn = op.get_bind()

    # Add column only if missing
    column_exists = conn.execute(sa.text("""
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'data_source_id'
    """)).fetchone()

    if not column_exists:
        with op.batch_alter_table("reports") as batch_op:
            batch_op.add_column(sa.Column("data_source_id", sa.Integer(), nullable=True))

    # Add FK if needed
    with op.batch_alter_table("reports") as batch_op:
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


def downgrade():
    # Just drop the foreign key and column (optional)
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("reports_data_source_id_fkey", type_="foreignkey")
        batch_op.drop_column("data_source_id")
