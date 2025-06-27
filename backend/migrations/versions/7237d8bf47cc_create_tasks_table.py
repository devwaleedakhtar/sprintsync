"""create tasks table

Revision ID: 7237d8bf47cc
Revises: 8f5dec987258
Create Date: 2025-06-27 19:50:07.696388

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '7237d8bf47cc'
down_revision: Union[str, Sequence[str], None] = '8f5dec987258'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create tasks table
    op.create_table('tasks',
                    sa.Column('id', postgresql.UUID(
                        as_uuid=True), nullable=False),
                    sa.Column('user_id', postgresql.UUID(
                        as_uuid=True), nullable=False),
                    sa.Column('title', sa.String(), nullable=False),
                    sa.Column('description', sa.String(), nullable=False),
                    sa.Column('status', sa.String(), nullable=False,
                              server_default='Todo'),
                    sa.Column('total_minutes', sa.Integer(), nullable=True),
                    sa.Column('created_at', sa.DateTime(), nullable=False),
                    sa.Column('updated_at', sa.DateTime(), nullable=False),
                    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('tasks')
