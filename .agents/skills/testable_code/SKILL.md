---
name: testable_code
description: Write maintainable, testable code using pure functions and proper separation of concerns
---

# Testable Code

## When to Apply

Activate this skill when:
- Writing new functions or classes
- Code is difficult to unit test
- Functions have side effects mixed with logic
- Mocking many dependencies in tests

## Core Principles

### 1. Pure Functions
**Same input = same output, no side effects**

```python
# ❌ Impure: side effect (I/O)
def add_and_log(a: int, b: int) -> int:
    result = a + b
    print(f"Result: {result}")  # Side effect!
    return result

# ✅ Pure: no side effects
def add(a: int, b: int) -> int:
    return a + b

# Separate the I/O
result = add(5, 3)
print(f"Result: {result}")  # I/O separate from logic
```

### 2. Dependency Injection
**Inject dependencies, don't create them**

```python
# ❌ Hard to test: creates its own dependency
class OrderService:
    def __init__(self):
        self.db = Database()  # Created internally!
    
    def get_order(self, id: int):
        return self.db.query(f"SELECT * FROM orders WHERE id={id}")

# ✅ Testable: dependency injected
class OrderService:
    def __init__(self, db: Database):
        self.db = db  # Injected!
    
    def get_order(self, id: int):
        return self.db.query(f"SELECT * FROM orders WHERE id={id}")

# In tests: inject a mock
mock_db = MockDatabase()
service = OrderService(mock_db)
```

### 3. Separation of Concerns
**Separate business logic from I/O**

```python
# ❌ Mixed concerns
def process_and_save(data):
    # Business logic
    processed = transform(data)
    validated = validate(processed)
    
    # I/O (hard to test!)
    with open("output.json", "w") as f:
        json.dump(validated, f)
    
    requests.post("https://api.example.com", json=validated)

# ✅ Separated concerns
def process(data) -> dict:
    """Pure business logic - easy to test!"""
    processed = transform(data)
    return validate(processed)

def save_to_file(data: dict, path: Path):
    """I/O only"""
    with open(path, "w") as f:
        json.dump(data, f)

def send_to_api(data: dict, url: str):
    """I/O only"""
    requests.post(url, json=data)

# Usage
result = process(data)  # Test this in isolation!
save_to_file(result, Path("output.json"))
send_to_api(result, "https://api.example.com")
```

## Implementation Pattern

```python
from dataclasses import dataclass
from typing import Callable, Optional

@dataclass
class CalculationResult:
    expression: str
    result: float

class Operations:
    """Pure functions - trivially testable"""
    
    @staticmethod
    def add(a: float, b: float) -> float:
        return a + b
    
    @staticmethod
    def subtract(a: float, b: float) -> float:
        return a - b
    
    @staticmethod
    def multiply(a: float, b: float) -> float:
        return a * b
    
    @staticmethod
    def divide(a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Division by zero")
        return a / b

class Calculator:
    """Testable via dependency injection"""
    
    def __init__(self, operations: Optional[Operations] = None):
        self.operations = operations or Operations()
    
    def calculate(self, a: float, op: str, b: float) -> float:
        ops = {
            '+': self.operations.add,
            '-': self.operations.subtract,
            '*': self.operations.multiply,
            '/': self.operations.divide,
        }
        return ops[op](a, b)
```

## Test Pattern

```python
import pytest

class TestOperations:
    """Test pure functions directly"""
    
    def test_add(self):
        assert Operations.add(2, 3) == 5
    
    def test_divide_by_zero(self):
        with pytest.raises(ValueError, match="Division by zero"):
            Operations.divide(10, 0)

class TestCalculator:
    """Test with injected dependencies"""
    
    def test_calculate_addition(self):
        calc = Calculator()
        assert calc.calculate(5, '+', 3) == 8
    
    def test_with_mock_operations(self):
        mock_ops = MockOperations()  # Custom mock
        calc = Calculator(operations=mock_ops)
        # Test behavior with mock
```

## Decision Tree

```
Does the function have side effects (I/O, state, randomness)?
├─ Yes → Extract pure logic, separate I/O
└─ No → ✓ (already testable)

Does the class create its own dependencies?
├─ Yes → Inject them via constructor
└─ No → ✓

Can I test this function without mocking many things?
├─ No → Refactor to reduce dependencies
└─ Yes → ✓
```

## Anti-Patterns to Avoid

| Anti-Pattern              | Problem           | Solution              |
| ------------------------- | ----------------- | --------------------- |
| I/O in business logic     | Untestable        | Separate concerns     |
| `new Dependency()` inside | Hard to mock      | Dependency injection  |
| Global state              | Flaky tests       | Pass state explicitly |
| `datetime.now()` in logic | Non-deterministic | Inject clock          |
| Many mocks needed         | Too coupled       | Simplify dependencies |
