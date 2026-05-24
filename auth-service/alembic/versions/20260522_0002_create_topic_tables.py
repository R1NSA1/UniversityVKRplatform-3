"""create topic tables

Revision ID: 20260522_0002
Revises: 20260405_0001
Create Date: 2026-05-22 18:15:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260522_0002"
down_revision: Union[str, None] = "20260405_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    application_status = postgresql.ENUM(
        "created",
        "student_confirmed",
        "teacher_confirmed",
        "approved",
        "rejected",
        name="application_status",
        create_type=False,
    )
    application_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "topics",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("teacher_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_topics_teacher_id"), "topics", ["teacher_id"], unique=False)
    op.create_index(op.f("ix_topics_status"), "topics", ["status"], unique=False)

    op.create_table(
        "applications",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("student_id", sa.String(), nullable=False),
        sa.Column("topic_id", sa.String(), nullable=False),
        sa.Column("status", application_status, nullable=False, server_default="created"),
        sa.Column("student_code", sa.String(length=10), nullable=False),
        sa.Column("teacher_code", sa.String(length=10), nullable=False),
        sa.Column("student_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("teacher_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_applications_student_id"), "applications", ["student_id"], unique=False)
    op.create_index(op.f("ix_applications_topic_id"), "applications", ["topic_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_applications_topic_id"), table_name="applications")
    op.drop_index(op.f("ix_applications_student_id"), table_name="applications")
    op.drop_table("applications")

    op.drop_index(op.f("ix_topics_status"), table_name="topics")
    op.drop_index(op.f("ix_topics_teacher_id"), table_name="topics")
    op.drop_table("topics")

    sa.Enum(name="application_status").drop(op.get_bind(), checkfirst=True)
