---
name: code_simplicity
description: Apply KISS, DRY, and YAGNI principles to avoid over-engineering
---

# Code Simplicity

## When to Apply

Activate this skill when:
- Building new features
- Refactoring existing code
- Reviewing code for complexity
- Tempted to add "future-proof" abstractions

## Core Principles

### 1. KISS - Keep It Simple
**Prefer simple solutions over clever ones**

```python
# ❌ Over-engineered: Factory + Strategy + Abstract class
class CaseConverterFactory:
    def create(self, case_type: str) -> AbstractCaseConverter:
        if case_type == "upper":
            return UpperCaseStrategy()
        elif case_type == "lower":
            return LowerCaseStrategy()
        ...

# ✅ KISS: Simple function
def change_case(text: str, case_type: str) -> str:
    if case_type == 'upper':
        return text.upper()
    elif case_type == 'lower':
        return text.lower()
    elif case_type == 'title':
        return text.title()
    raise ValueError(f"Unknown case: {case_type}")
```

```python
# ❌ Clever: One-liner magic
result = [x for x in (lambda f: (lambda x: f(f, x)))(lambda f, n: n if n <= 1 else f(f, n-1) + f(f, n-2))(i) for i in range(10)]

# ✅ KISS: Clear and obvious
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = [fibonacci(i) for i in range(10)]
```

### 2. DRY - Don't Repeat Yourself
**Extract common logic into functions**

```python
# ❌ WET (Write Everything Twice)
def greet_morning(name: str) -> str:
    if not name:
        name = "Guest"
    if len(name) > 20:
        name = name[:20] + "..."
    return f"Hello, {name}! Good morning!"

def greet_afternoon(name: str) -> str:
    if not name:
        name = "Guest"
    if len(name) > 20:
        name = name[:20] + "..."
    return f"Hello, {name}! Good afternoon!"

# ✅ DRY: Single function with parameter
def greet_user(name: str, time_of_day: str = "day") -> str:
    if not name:
        name = "Guest"
    if len(name) > 20:
        name = name[:20] + "..."
    return f"Hello, {name}! Good {time_of_day}!"
```

### 3. YAGNI - You Aren't Gonna Need It
**Don't build for hypothetical futures**

```python
# ❌ YAGNI violation: Building for "maybe someday"
class StringProcessor:
    def __init__(self):
        self.plugins = []
        self.middleware = []
        self.event_bus = EventBus()
        self.cache = LRUCache(1000)
        self.metrics = MetricsCollector()
    
    def process(self, text: str) -> str:
        # 50 lines of "extensible" infrastructure
        # Just to uppercase a string...
        return text.upper()

# ✅ YAGNI: Build what you need NOW
def process_string(text: str) -> str:
    return text.upper()

# Add complexity WHEN actually needed, not before
```

## Decision Tree

```
Is this solution more complex than necessary?
├─ Yes → Simplify (KISS)
└─ No → ✓

Have I written this exact logic elsewhere?
├─ Yes → Extract to function (DRY)
└─ No → ✓

Am I adding features "just in case"?
├─ Yes → Remove them (YAGNI)
└─ No → ✓

Can I explain this code easily to someone?
├─ No → Too complex, simplify (KISS)
└─ Yes → ✓
```

## Refactoring Examples

### Before: Over-engineered
```python
# 100+ lines with factories, strategies, enums
class StringFormatterFactory:
    ...
class AbstractFormatter(ABC):
    ...
class UpperFormatter(AbstractFormatter):
    ...
# etc.
```

### After: Simple and sufficient
```python
# ~20 lines, same functionality
def format_string(text: str, format_type: str) -> str:
    formats = {
        'upper': str.upper,
        'lower': str.lower,
        'title': str.title,
    }
    if format_type not in formats:
        raise ValueError(f"Unknown format: {format_type}")
    return formats[format_type](text)
```

## Anti-Patterns to Avoid

| Anti-Pattern             | Principle Violated | Solution               |
| ------------------------ | ------------------ | ---------------------- |
| Factory for 2 options    | KISS               | Simple if/else or dict |
| Copy-pasted code         | DRY                | Extract to function    |
| "Extensible" unused code | YAGNI              | Delete it              |
| One-liner magic          | KISS               | Readable, obvious code |
| AbstractFactoryFactory   | KISS               | Question if needed     |

## Remember

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

> "The best code is no code at all." — Jeff Atwood

When in doubt, choose the simpler solution. You can always add complexity later when you actually need it.
