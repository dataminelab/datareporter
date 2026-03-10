"""Add query_id FK to models table for SQL-powered OLAP cubes.

Links models to Redash queries. The query SQL is wrapped as a CTE
via Plywood's withQuery mechanism at execution time.

Revision ID: 8726b10fc3f6
Revises: febb1459b2c2
Create Date: 2026-03-10

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '8726b10fc3f6'
down_revision = 'febb1459b2c2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('models', sa.Column('query_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_models_query_id',
        'models', 'queries',
        ['query_id'], ['id'],
    )


def downgrade():
    op.drop_constraint('fk_models_query_id', 'models', type_='foreignkey')
    op.drop_column('models', 'query_id')
