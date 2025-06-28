"""add is_admin column to the users table

Revision ID: 4b3dcfb3e9fd
Revises: 53d613ddeabb
Create Date: 2025-06-28 23:29:35.163622

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b3dcfb3e9fd'
down_revision: Union[str, Sequence[str], None] = '53d613ddeabb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('is_admin', sa.Boolean(),
                  nullable=True, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'is_admin')
