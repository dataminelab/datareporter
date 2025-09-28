"""initiating profile urls into users table

Revision ID: 1234dca2a603
Revises: 9e8c841d1a30
Create Date: 2017-11-22 22:20:25.166045

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "1234dca2a603"
down_revision = "9e8c841d1a30"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("profile_image_url", sa.String(), nullable=True, server_default=None),
    )


def downgrade():
    op.drop_column("users", "profile_image_url")
