"""Add is_draft column to reports

Revision ID: a1b2c3d4e5f6
Revises: febb1459b2c2
Create Date: 2026-04-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "4fd85b6d30f2"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    result = conn.execute(sa.text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='reports' AND column_name='is_draft'
    """))

    if not result.first():
        with op.batch_alter_table("reports") as batch_op:
            batch_op.add_column(
                sa.Column("is_draft", sa.Boolean(), nullable=False, server_default=sa.text("true"))
            )
        op.create_index("ix_reports_is_draft", "reports", ["is_draft"])


def downgrade():
    op.drop_index("ix_reports_is_draft", table_name="reports")
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_column("is_draft")
