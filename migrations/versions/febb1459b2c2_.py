"""empty message

Revision ID: febb1459b2c2
Revises: 9f4a3f20c1d2
Create Date: 2025-04-11 15:26:07.935791

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'febb1459b2c2'
down_revision = '9f4a3f20c1d2'
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

    # Update rows with NULL
    conn.execute(sa.text("""
        UPDATE reports SET data_source_id = 1 WHERE 1=1
    """))


def downgrade():
    # Just drop the foreign key and column (optional)
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("reports_data_source_id_fkey", type_="foreignkey")
        batch_op.drop_column("data_source_id")
