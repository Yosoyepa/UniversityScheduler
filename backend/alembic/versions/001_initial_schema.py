"""Initial schema with all 6 tables.

Revision ID: 001
Revises: 
Create Date: 2026-01-24

Following erd.puml specification:
- users (id, email, hashed_password, full_name, is_active, created_at, updated_at)
- settings (user_id FK, dark_mode, email_notifications, alert_preferences JSONB)
- semesters (id, user_id FK, name, start_date, end_date, is_active, timestamps)
- subjects (id, semester_id FK, name, group_code, credits, color, difficulty, type, professor_name, timestamps)
- class_sessions (id, subject_id FK, day_of_week, start_time, end_time, location, attendance_required)
- tasks (id, user_id FK, subject_id FK nullable, title, description, due_date, status, priority, category, is_synced_gcal, gcal_event_id, completed_at, timestamps)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types first
    difficulty_level = postgresql.ENUM('EASY', 'MEDIUM', 'HARD', name='difficulty_level', create_type=False)
    subject_type = postgresql.ENUM('DISCIPLINAR_OBLIGATORIA', 'DISCIPLINAR_OPTATIVA', 'FUNDAMENTAL', 'LIBRE_ELECCION', name='subject_type', create_type=False)
    task_status = postgresql.ENUM('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED', name='task_status', create_type=False)
    task_priority = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', name='task_priority', create_type=False)
    task_category = postgresql.ENUM('TASK', 'EXAM', 'PROJECT', 'READING', name='task_category', create_type=False)
    
    difficulty_level.create(op.get_bind(), checkfirst=True)
    subject_type.create(op.get_bind(), checkfirst=True)
    task_status.create(op.get_bind(), checkfirst=True)
    task_priority.create(op.get_bind(), checkfirst=True)
    task_category.create(op.get_bind(), checkfirst=True)
    
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Settings table (1:1 with users)
    op.create_table(
        'settings',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('dark_mode', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('alert_preferences', postgresql.JSONB, nullable=False, server_default='{"days_before": [1], "hours_before": [1]}'),
    )
    
    # Semesters table
    op.create_table(
        'semesters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Subjects table
    op.create_table(
        'subjects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('semester_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('semesters.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('group_code', sa.String(50), nullable=True),
        sa.Column('credits', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('color', sa.String(7), nullable=False, server_default="'#3b82f6'"),
        sa.Column('difficulty', difficulty_level, nullable=False, server_default="'MEDIUM'"),
        sa.Column('type', subject_type, nullable=False),
        sa.Column('professor_name', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Class sessions table
    op.create_table(
        'class_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('day_of_week', sa.Integer(), nullable=False),  # 1=Monday, 7=Sunday
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('attendance_required', sa.Boolean(), nullable=False, server_default='true'),
    )
    
    # Tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', task_status, nullable=False, server_default="'TODO'"),
        sa.Column('priority', task_priority, nullable=False, server_default="'MEDIUM'"),
        sa.Column('category', task_category, nullable=False, server_default="'TASK'"),
        sa.Column('is_synced_gcal', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('gcal_event_id', sa.String(255), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('tasks')
    op.drop_table('class_sessions')
    op.drop_table('subjects')
    op.drop_table('semesters')
    op.drop_table('settings')
    op.drop_table('users')
    
    # Drop ENUM types
    op.execute('DROP TYPE IF EXISTS difficulty_level')
    op.execute('DROP TYPE IF EXISTS subject_type')
    op.execute('DROP TYPE IF EXISTS task_status')
    op.execute('DROP TYPE IF EXISTS task_priority')
    op.execute('DROP TYPE IF EXISTS task_category')
