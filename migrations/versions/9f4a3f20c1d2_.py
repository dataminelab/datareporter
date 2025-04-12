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
    try:
        with op.batch_alter_table("reports") as batch_op:
            batch_op.drop_column("data_source_id")
    except Exception:
        pass
