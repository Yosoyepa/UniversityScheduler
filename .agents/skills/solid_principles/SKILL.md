---
name: solid_principles
description: Apply SOLID-adjacent design principles for clean, modular code architecture
---

# SOLID Design Principles

## When to Apply

Activate this skill when:
- Creating new classes or modules
- Refactoring existing code with mixed responsibilities
- Designing component interactions
- Code smells detected: God classes, tight coupling, rigid dependencies

## Core Principles

### 1. Single Responsibility (SRP)
**One class = one reason to change**

```python
# ❌ Bad: UserManager does validation, storage, and email
class UserManager:
    def validate_email(self): ...
    def save_to_db(self): ...
    def send_email(self): ...

# ✅ Good: Separate classes
class EmailValidator: ...
class UserRepository: ...
class EmailService: ...
```

### 2. Encapsulation & Abstraction
**Hide internals, expose behavior**

```python
# ❌ Bad: Public state
class BankAccount:
    balance = 0  # Anyone can modify!

# ✅ Good: Controlled access
class BankAccount:
    def __init__(self):
        self._balance = 0  # Private
    
    def deposit(self, amount: float):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self._balance += amount
    
    def get_balance(self) -> float:
        return self._balance
```

### 3. Loose Coupling & Dependency Injection
**Depend on abstractions, inject dependencies**

```python
from abc import ABC, abstractmethod

# ✅ Interface
class Notifier(ABC):
    @abstractmethod
    def send(self, message: str): pass

# ✅ Implementations
class EmailNotifier(Notifier):
    def send(self, message: str):
        print(f"Email: {message}")

class SMSNotifier(Notifier):
    def send(self, message: str):
        print(f"SMS: {message}")

# ✅ Dependency injection
class OrderProcessor:
    def __init__(self, notifier: Notifier):  # Inject dependency
        self.notifier = notifier
    
    def process(self, order_id: int):
        # Process order...
        self.notifier.send(f"Order {order_id} complete")
```

### 4. Open/Closed (Extensibility)
**Open for extension, closed for modification**

```python
from abc import ABC, abstractmethod

# ✅ Strategy pattern
class ReportFormatter(ABC):
    @abstractmethod
    def format(self, data: list) -> str: pass

class CSVFormatter(ReportFormatter):
    def format(self, data: list) -> str:
        return ",".join(str(d) for d in data)

class JSONFormatter(ReportFormatter):
    def format(self, data: list) -> str:
        import json
        return json.dumps(data)

# Add new formats WITHOUT modifying existing code!
class XMLFormatter(ReportFormatter):
    def format(self, data: list) -> str:
        return f"<data>{data}</data>"
```

## Decision Tree

```
Is the class doing more than one thing?
├─ Yes → Split it (SRP)
└─ No → ✓

Can external code modify internal state?
├─ Yes → Make it private, add methods (Encapsulation)
└─ No → ✓

Are dependencies created inside the class?
├─ Yes → Inject them via constructor (Loose Coupling)
└─ No → ✓

Must you edit existing code to add new behavior?
├─ Yes → Use interfaces + strategy pattern (Open/Closed)
└─ No → ✓
```

## Anti-Patterns to Avoid

| Anti-Pattern          | Problem          | Solution                |
| --------------------- | ---------------- | ----------------------- |
| God class             | Does everything  | Split by responsibility |
| Public fields         | State corruption | Private + methods       |
| `new` inside class    | Untestable       | Dependency injection    |
| Giant if/else         | Rigid            | Strategy/polymorphism   |
| Concrete dependencies | Tight coupling   | Depend on interfaces    |

## Python Tips

```python
# Use ABC for interfaces
from abc import ABC, abstractmethod

# Use @dataclass for data containers
from dataclasses import dataclass

# Use type hints
def process(data: List[str]) -> Dict[str, int]: ...
```
