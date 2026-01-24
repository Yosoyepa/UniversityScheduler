# Behavioral Diagrams (PlantUML)

## Sequence Diagram: Adding a Class with Conflict Detection

This flow demonstrates the "Resilient Pragmatism" approach: validation happens in the core domain before hitting the database.

```plantuml
@startuml
actor User
participant API as "API Controller"
participant UC as "AddClassUseCase"
participant Repo as "SubjectRepository"
participant Domain as "ScheduleService"

User -> API: POST /classes (JSON)
API -> UC: execute(dto)

UC -> Repo: findBySemester(currentSemester)
Repo --> UC: List<Subject> existingSubjects

UC -> Domain: checkConflicts(newSubject, existingSubjects)
activate Domain
loop Every Session
    Domain -> Domain: intersect(newTime, existingTime)
end

alt Conflict Detected
    Domain --> UC: Exception(TimeConflict)
    UC --> API: Error 409 Conflict
    API --> User: "Class overlaps with Math 101"
else Time Slot Free
    Domain --> UC: Valid
    
    UC -> Repo: save(newSubject)
    Repo --> UC: Subject(id=...)
    UC --> API: Success 201 Created
    API --> User: {id: "...", name: "..."}
end
deactivate Domain
@enduml
```

## State Diagram: Task Lifecycle

The lifecycle of a Task entity, illustrating valid transitions for the Kanban board.

```plantuml
@startuml
hide empty description

[*] --> ToDo : Created

ToDo --> InProgress : Start Working
ToDo --> Archived : Delete/Archive

InProgress --> Done : Complete
InProgress --> ToDo : Move Back

Done --> Archived : End of Semester
Done --> InProgress : Re-open

Archived --> [*]
@enduml
```
