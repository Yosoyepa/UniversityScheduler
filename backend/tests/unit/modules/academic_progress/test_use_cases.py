import uuid
import pytest
from unittest.mock import AsyncMock

from app.modules.academic_progress.application.use_cases import CalculateSubjectAverageUseCase
from app.modules.academic_progress.domain.entities import Grade, EvaluationCriteria
from app.modules.academic_progress.port.repository import IGradeRepository, IEvaluationCriteriaRepository

@pytest.mark.asyncio
async def test_calculate_subject_average_with_weights():
    user_id = uuid.uuid4()
    subject_id = uuid.uuid4()
    
    # 2 criteria: Parcial (60%), Taller (40%)
    c1_id = uuid.uuid4()
    c2_id = uuid.uuid4()
    
    mock_criteria = [
        EvaluationCriteria(id=c1_id, subject_id=subject_id, name="Parcial", weight=60.0),
        EvaluationCriteria(id=c2_id, subject_id=subject_id, name="Taller", weight=40.0),
    ]
    
    # Grades: Parcial 5.0 (100%), Taller 2.5 (50%)
    # Expected average: (100 * 0.6) + (50 * 0.4) = 60 + 20 = 80.0
    mock_grades = [
        Grade(user_id=user_id, subject_id=subject_id, criteria_id=c1_id, score=5.0, max_score=5.0),
        Grade(user_id=user_id, subject_id=subject_id, criteria_id=c2_id, score=2.5, max_score=5.0),
    ]
    
    grade_repo = AsyncMock(spec=IGradeRepository)
    grade_repo.get_by_subject.return_value = mock_grades
    
    criteria_repo = AsyncMock(spec=IEvaluationCriteriaRepository)
    criteria_repo.get_by_subject.return_value = mock_criteria
    
    use_case = CalculateSubjectAverageUseCase(grade_repo, criteria_repo)
    result = await use_case.execute(subject_id, user_id)
    
    assert result.subject_id == subject_id
    assert result.average == 80.0
    assert result.grades_count == 2
    assert result.criteria_count == 2
    assert result.is_complete is True

@pytest.mark.asyncio
async def test_calculate_subject_average_without_criteria():
    user_id = uuid.uuid4()
    subject_id = uuid.uuid4()
    
    # No criteria assigned
    mock_criteria = []
    
    # Grades without criteria: 4.5/5.0 (90%) and 3.0/5.0 (60%)
    # Expected fallback simple average: (90 + 60) / 2 = 75.0
    mock_grades = [
        Grade(user_id=user_id, subject_id=subject_id, score=4.5, max_score=5.0),
        Grade(user_id=user_id, subject_id=subject_id, score=3.0, max_score=5.0),
    ]
    
    grade_repo = AsyncMock(spec=IGradeRepository)
    grade_repo.get_by_subject.return_value = mock_grades
    
    criteria_repo = AsyncMock(spec=IEvaluationCriteriaRepository)
    criteria_repo.get_by_subject.return_value = mock_criteria
    
    use_case = CalculateSubjectAverageUseCase(grade_repo, criteria_repo)
    result = await use_case.execute(subject_id, user_id)
    
    assert result.average == 75.0
    assert result.grades_count == 2
    assert result.criteria_count == 0
    assert result.is_complete is False

@pytest.mark.asyncio
async def test_calculate_subject_average_partial_completion():
    user_id = uuid.uuid4()
    subject_id = uuid.uuid4()
    
    c1_id = uuid.uuid4()
    c2_id = uuid.uuid4() # Missing grade for this one
    
    mock_criteria = [
        EvaluationCriteria(id=c1_id, subject_id=subject_id, name="P1", weight=50.0),
        EvaluationCriteria(id=c2_id, subject_id=subject_id, name="P2", weight=50.0),
    ]
    
    # Only one grade recorded: 2.0/5.0 (40%) on c1
    # Average computation: (40*50)/50 = 40.0% so far on the graded part
    mock_grades = [
        Grade(user_id=user_id, subject_id=subject_id, criteria_id=c1_id, score=2.0, max_score=5.0),
    ]
    
    grade_repo = AsyncMock(spec=IGradeRepository)
    grade_repo.get_by_subject.return_value = mock_grades
    
    criteria_repo = AsyncMock(spec=IEvaluationCriteriaRepository)
    criteria_repo.get_by_subject.return_value = mock_criteria
    
    use_case = CalculateSubjectAverageUseCase(grade_repo, criteria_repo)
    result = await use_case.execute(subject_id, user_id)
    
    assert result.average == 40.0
    assert result.is_complete is False
