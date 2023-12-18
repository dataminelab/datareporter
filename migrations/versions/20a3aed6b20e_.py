"""empty message

Revision ID: 20a3aed6b20e
Revises: 40a8d5338228
Create Date: 2020-11-22 16:55:41.357081

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20a3aed6b20e'
down_revision = '40a8d5338228'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "model_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("content", sa.VARCHAR(length=6_000), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("model_id", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["model_id"], ["models.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("model_configs")
