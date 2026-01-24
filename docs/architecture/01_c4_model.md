# C4 Architecture Model (PlantUML)

## Level 1: System Context Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

Person(student, "University Student", "A student who wants to manage their academic schedule and tasks.")
System(scheduler, "University Scheduler", "Allows users to manage classes, tasks, and exams.")

System_Ext(google_cal, "Google Calendar", "External calendar system for sync.")
System_Ext(univ_portal, "University Portal", "Source of official class data (Future).")

Rel(student, scheduler, "Uses", "HTTPS")
Rel(scheduler, google_cal, "Syncs events to", "Google API/JSON")
Rel(scheduler, univ_portal, "Scrapes/Imports from", "HTTPS")
@enduml
```

## Level 2: Container Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(student, "University Student", "Uses the app via browser or mobile.")

System_Boundary(c1, "University Scheduler") {
    Container(web_app, "Web Application", "Next.js (React)", "Delivers the SPA/PWA to the user's browser.")
    Container(api, "API Application", "Python (FastAPI)", "Handles business logic, auth, and data access via Ports & Adapters.")
    ContainerDb(database, "Database", "PostgreSQL", "Stores user data, schedules, and tasks.")
}

System_Ext(google_cal, "Google Calendar", "External Calendar")

Rel(student, web_app, "Visits", "HTTPS")
Rel(web_app, api, "API calls", "JSON/REST")
Rel(api, database, "Reads/Writes", "SQL/SQLAlchemy")
Rel(api, google_cal, "Syncs", "HTTPS/JSON")
@enduml
```

## Level 3: Component Diagram (API Application)

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

Container(web_app, "Web Application", "Next.js")
ContainerDb(database, "PostgreSQL", "DB")

Container_Boundary(api, "API Application") {
    Component(api_controller, "API Controllers", "FastAPI Routes", "Handles HTTP requests and maps them to parameters.")
    Component(auth_middleware, "Auth Middleware", "FastAPI Depends", "Validates JWT/Sessions.")

    boundary "Domain Core (Cloud Agnostic)" {
        Component(schedule_service, "Schedule Service", "Python Class", "Business logic for detecting conflicts and managing classes.")
        Component(task_service, "Task Service", "Python Class", "Business logic for Kanban and due dates.")
        Component(domain_models, "Domain Entities", "Pydantic/Dataclasses", "Pure data structures (Class, Task, User).")
    }

    boundary "Ports (Interfaces)" {
        Component(repo_interface, "IRepository", "ABC", "Interface for data access.")
        Component(cal_interface, "ICalendarProvider", "ABC", "Interface for external calendars.")
    }

    boundary "Adapters (Infrastructure)" {
        Component(pg_adapter, "PostgresAdapter", "SQLAlchemy", "Implements IRepository for PostgreSQL.")
        Component(gcal_adapter, "GoogleCalendarAdapter", "Google Client Lib", "Implements ICalendarProvider.")
    }
}

Rel(web_app, api_controller, "Uses", "JSON/HTTP")
Rel(api_controller, auth_middleware, "Uses")
Rel(api_controller, schedule_service, "Calls")
Rel(api_controller, task_service, "Calls")

Rel(schedule_service, domain_models, "Manipulates")
Rel(schedule_service, repo_interface, "Uses")
Rel(schedule_service, cal_interface, "Uses")

Rel(pg_adapter, repo_interface, "Implements")
Rel(gcal_adapter, cal_interface, "Implements")

Rel(pg_adapter, database, "SQL")
@enduml
```
