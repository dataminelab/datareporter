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
    # Drop the column if it exists
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_column("data_source_id")

    # Re-add the column and foreign key
    with op.batch_alter_table("reports") as batch_op:
        batch_op.add_column(sa.Column("data_source_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_reports_data_source_id_data_sources",
            "data_sources",
            ["data_source_id"],
            ["id"],
        )


def downgrade():
    # Remove the foreign key and column again
    with op.batch_alter_table("reports") as batch_op:
        batch_op.drop_constraint("fk_reports_data_source_id_data_sources", type_="foreignkey")
        batch_op.drop_column("data_source_id")
