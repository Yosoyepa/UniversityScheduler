# Diagramas PlantUML

Esta carpeta contiene todos los diagramas de arquitectura del proyecto University Scheduler en formato PlantUML.

## Estructura

```
diagrams/
├── c4/                          # Diagramas C4 Model
│   ├── 01_system_context.puml   # Nivel 1: Contexto del Sistema
│   ├── 02_container.puml        # Nivel 2: Contenedores
│   └── 03_component.puml        # Nivel 3: Componentes
│
├── domain/                      # Diagramas de Dominio
│   └── domain_class_diagram.puml # Modelo de clases del dominio
│
└── behavioral/                  # Diagramas de Comportamiento
    ├── add_class_sequence.puml  # Secuencia: Agregar clase con detección de conflictos
    └── task_lifecycle_state.puml # Estado: Ciclo de vida de tareas
```

## Cómo visualizar los diagramas

### Opción 1: PlantUML Online
Visita [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/) y pega el contenido del archivo `.puml`.

### Opción 2: VS Code Extension
Instala la extensión "PlantUML" de jebbs para visualizar los diagramas directamente en VS Code.

### Opción 3: Línea de comandos
Asegúrate de ejecutar los comandos desde la raíz del proyecto (`UniversityScheduler/`).

```bash
# Instalar PlantUML (requiere Java)
sudo apt install plantuml

# Generar PNG de todos los diagramas
plantuml docs/diagrams/**/*.puml

# Generar un diagrama específico (ej. C4)
plantuml docs/diagrams/c4/*.puml
```

## Convención de nombres

- `01_`, `02_`, `03_` - Prefijos numéricos para ordenar los diagramas C4 por nivel
- `*_sequence.puml` - Diagramas de secuencia
- `*_state.puml` - Diagramas de estado
- `*_class.puml` - Diagramas de clases
