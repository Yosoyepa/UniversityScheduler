"""phase6_professors_module

Adds the Professors directory module tables and migrates subject professor
data from the free-text professor_name field to a normalized professor_id FK.

Steps:
  1. Create `professors` table (private per user)
  2. Create `office_hours` table
  3. Create `tutoring_sessions` table
  4. Add nullable `professor_id` FK to `subjects`
  5. Data migration: create Professor rows from unique professor_name strings
  6. Drop `professor_name` column from `subjects`

Revision ID: 002_phase6_professors
Revises: 7af1d399f392
Create Date: 2026-04-05
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# ---------------------------------------------------------------------------
# Revision identifiers
# ---------------------------------------------------------------------------
revision: str = '002_phase6_professors'
down_revision: Union[str, Sequence[str], None] = '7af1d399f392'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply Phase 6 schema changes."""

    # ------------------------------------------------------------------
    # 1. Create ENUM for tutoring session status
    # ------------------------------------------------------------------
    tutoring_status = postgresql.ENUM(
        'SCHEDULED', 'CANCELLED', 'COMPLETED',
        name='tutoring_session_status',
        create_type=False,
    )
    tutoring_status.create(op.get_bind(), checkfirst=True)

    location_type_enum = postgresql.ENUM(
        'OFFICE', 'LAB', 'VIRTUAL',
        name='office_hour_location_type',
        create_type=False,
    )
    location_type_enum.create(op.get_bind(), checkfirst=True)

    # ------------------------------------------------------------------
    # 2. Create `professors` table  (private per user)
    # ------------------------------------------------------------------
    op.create_table(
        'professors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('department', sa.String(200), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ------------------------------------------------------------------
    # 3. Create `office_hours` table
    # ------------------------------------------------------------------
    op.create_table(
        'office_hours',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'professor_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('professors.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('day_of_week', sa.Integer(), nullable=False),   # 1=Mon, 7=Sun
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('location_type', location_type_enum, nullable=False, server_default=sa.text("'OFFICE'")),
        sa.Column('location_details', sa.String(255), nullable=True),
    )

    # ------------------------------------------------------------------
    # 4. Create `tutoring_sessions` table
    # Session is self-confirmed (SCHEDULED on creation — pre-agreed with prof)
    # ------------------------------------------------------------------
    op.create_table(
        'tutoring_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'professor_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('professors.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('meeting_link', sa.String(500), nullable=True),
        sa.Column(
            'status',
            tutoring_status,
            nullable=False,
            server_default=sa.text("'SCHEDULED'"),
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ------------------------------------------------------------------
    # 5. Add nullable `professor_id` FK to `subjects`
    # Must be nullable during migration (filled in step 6)
    # ------------------------------------------------------------------
    op.add_column(
        'subjects',
        sa.Column(
            'professor_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('professors.id', ondelete='SET NULL'),
            nullable=True,
        ),
    )

    # ------------------------------------------------------------------
    # 6. Data migration: promote unique professor_name strings to rows
    #    in the `professors` table and update subjects.professor_id
    # ------------------------------------------------------------------
    connection = op.get_bind()

    # Fetch all subjects that have a non-null professor_name
    rows = connection.execute(
        sa.text(
            """
            SELECT s.id AS subject_id,
                   s.professor_name,
                   sem.user_id
            FROM subjects s
            JOIN semesters sem ON sem.id = s.semester_id
            WHERE s.professor_name IS NOT NULL
              AND trim(s.professor_name) != ''
            """
        )
    ).fetchall()

    # Build a per-user cache so we don't duplicate rows for the same name + user
    # key: (user_id, lower(professor_name)) → professor UUID
    professor_cache: dict = {}

    for subject_id, professor_name, user_id in rows:
        cache_key = (str(user_id), professor_name.strip().lower())

        if cache_key not in professor_cache:
            new_professor_id = uuid.uuid4()
            connection.execute(
                sa.text(
                    """
                    INSERT INTO professors (id, user_id, name, created_at, updated_at)
                    VALUES (:id, :user_id, :name, now(), now())
                    """
                ),
                {
                    "id": str(new_professor_id),
                    "user_id": str(user_id),
                    "name": professor_name.strip(),
                },
            )
            professor_cache[cache_key] = new_professor_id

        professor_id = professor_cache[cache_key]

        connection.execute(
            sa.text(
                "UPDATE subjects SET professor_id = :pid WHERE id = :sid"
            ),
            {"pid": str(professor_id), "sid": str(subject_id)},
        )

    # ------------------------------------------------------------------
    # 7. Drop the now-redundant professor_name column from subjects
    # ------------------------------------------------------------------
    op.drop_column('subjects', 'professor_name')


def downgrade() -> None:
    """Revert Phase 6 schema changes."""
    # Restore professor_name column (data is NOT restored — irreversible)
    op.add_column(
        'subjects',
        sa.Column('professor_name', sa.String(200), nullable=True),
    )

    op.drop_column('subjects', 'professor_id')
    op.drop_table('tutoring_sessions')
    op.drop_table('office_hours')
    op.drop_table('professors')

    op.execute('DROP TYPE IF EXISTS tutoring_session_status')
    op.execute('DROP TYPE IF EXISTS office_hour_location_type')
