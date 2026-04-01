import uuid
import pytest
from app.modules.academic_progress.domain.entities import Grade, EvaluationCriteria
from app.shared.domain.exceptions import InvalidEntityStateException

def test_grade_normalized_score():
    # Valid normal score
    grade = Grade(
        user_id=uuid.uuid4(),
        subject_id=uuid.uuid4(),
        score=4.5,
        max_score=5.0
    )
    assert grade.normalized_score() == 90.0

    # Zero score
    grade_zero = Grade(
        user_id=uuid.uuid4(),
        subject_id=uuid.uuid4(),
        score=0.0,
        max_score=5.0
    )
    assert grade_zero.normalized_score() == 0.0

    # Max score
    grade_max = Grade(
        user_id=uuid.uuid4(),
        subject_id=uuid.uuid4(),
        score=100.0,
        max_score=100.0
    )
    assert grade_max.normalized_score() == 100.0

def test_grade_invariants():
    # Negative score should fail
    with pytest.raises(InvalidEntityStateException):
        Grade(user_id=uuid.uuid4(), subject_id=uuid.uuid4(), score=-1.0, max_score=5.0)

    # Score > max_score should fail
    with pytest.raises(InvalidEntityStateException):
        Grade(user_id=uuid.uuid4(), subject_id=uuid.uuid4(), score=6.0, max_score=5.0)

    # Max_score <= 0 should fail
    with pytest.raises(InvalidEntityStateException):
        Grade(user_id=uuid.uuid4(), subject_id=uuid.uuid4(), score=0.0, max_score=0.0)

def test_evaluation_criteria_invariants():
    # Negative weight should fail
    with pytest.raises(InvalidEntityStateException):
        EvaluationCriteria(subject_id=uuid.uuid4(), name="Test", weight=-10.0)

    # Weight > 100 should fail
    with pytest.raises(InvalidEntityStateException):
        EvaluationCriteria(subject_id=uuid.uuid4(), name="Test", weight=101.0)

    # Empty name should fail
    with pytest.raises(InvalidEntityStateException):
        EvaluationCriteria(subject_id=uuid.uuid4(), name=" ", weight=10.0)

def test_grade_update_score():
    grade = Grade(user_id=uuid.uuid4(), subject_id=uuid.uuid4(), score=3.0, max_score=5.0)
    grade.update_score(4.0, "Mejorado")
    assert grade.score == 4.0
    assert grade.notes == "Mejorado"

    with pytest.raises(InvalidEntityStateException):
        grade.update_score(6.0) # > max_score
