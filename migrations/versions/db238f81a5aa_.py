"""Drop and re-add data_source_id column in reports

Revision ID: db238f81a5aa
Revises: fd4fc850d7ea
Create Date: 2025-04-11

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'db238f81a5aa'
down_revision = 'fd4fc850d7ea'
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

    # Pick a fallback id
    fallback_result = conn.execute(sa.text("SELECT id FROM data_sources ORDER BY RANDOM() LIMIT 1"))
    fallback_id = fallback_result.scalar() or 1

    # Update rows with NULL
    conn.execute(sa.text("""
        UPDATE reports 
        SET data_source_id = :fallback 
        WHERE data_source_id IS NULL
    """), {"fallback": fallback_id})


def downgrade():
    # Just drop the foreign key and column (optional)
    with op.batch_alter_table("reports") as batch_op:
        try:
            batch_op.drop_column("data_source_id")
        except Exception:
            pass