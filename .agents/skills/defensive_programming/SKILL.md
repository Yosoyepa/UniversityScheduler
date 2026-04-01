---
name: defensive_programming
description: Write fail-fast code with input validation, safe defaults, and proper error handling
---

# Defensive Programming

## When to Apply

Activate this skill when:
- Processing external input (user, API, file)
- Handling sensitive data (payments, credentials)
- Designing function/method signatures
- Setting default parameter values

## Core Principles

### 1. Fail-Fast
**Validate input immediately, report errors clearly**

```python
class PaymentValidator:
    @staticmethod
    def validate_amount(amount) -> Decimal:
        """Fail-fast: validate immediately"""
        try:
            amount_decimal = Decimal(str(amount))
        except Exception:
            raise ValidationError(f"Invalid amount format: {amount}")
        
        if amount_decimal <= 0:
            raise ValidationError(f"Amount must be positive: {amount_decimal}")
        
        if amount_decimal > Decimal("10000"):
            raise ValidationError(f"Amount exceeds limit: {amount_decimal}")
        
        return amount_decimal
```

### 2. Safe Defaults
**Conservative, secure default values**

```python
# ❌ Bad: Dangerous defaults
def process(debug=True, timeout=None, max_retries=100): ...

# ✅ Good: Safe defaults
def process(
    debug: bool = False,    # Security: OFF by default
    timeout: int = 30,      # Never infinite
    max_retries: int = 3    # Reasonable limit
): ...
```

### 3. Least Privilege
**Store/log only necessary data**

```python
# ❌ Bad: Logging sensitive data
print(f"Processing card: {card_number}")  # Full card number!

# ✅ Good: Mask sensitive data
def mask_card(card: str) -> str:
    return f"****-****-****-{card[-4:]}"

print(f"Processing card: {mask_card(card_number)}")
# Never log: passwords, CVV, tokens, full SSN
```

### 4. Proper Exception Handling
**Don't swallow errors, propagate with context**

```python
# ❌ Bad: Silent failure
try:
    result = process_payment(amount)
except Exception:
    pass  # Error swallowed!

# ✅ Good: Fail loud with context
try:
    result = process_payment(amount)
except Exception as e:
    raise PaymentError(f"Payment failed for ${amount}") from e
```

## Implementation Pattern

```python
from dataclasses import dataclass
from decimal import Decimal

class ValidationError(Exception):
    """Custom exception for validation"""
    pass

@dataclass(frozen=True)  # Immutable result
class PaymentResult:
    transaction_id: str
    amount: Decimal
    masked_account: str  # Only last 4 digits
    status: str

class PaymentProcessor:
    def __init__(
        self,
        debug_mode: bool = False,  # Safe default
        max_retry: int = 3,
        timeout: int = 30
    ):
        self.debug_mode = debug_mode
        self.max_retry = max_retry
        self.timeout = timeout
    
    def process(self, amount, account: str, cvv: str) -> PaymentResult:
        # FAIL-FAST: Validate all inputs first
        validated_amount = self._validate_amount(amount)
        validated_account = self._validate_account(account)
        
        # LEAST PRIVILEGE: Never store CVV
        # Only log masked account
        if self.debug_mode:
            print(f"Processing ${validated_amount} from ****{account[-4:]}")
        
        # Process and return immutable result
        return PaymentResult(
            transaction_id="TXN-001",
            amount=validated_amount,
            masked_account=f"****{account[-4:]}",
            status="SUCCESS"
        )
```

## Decision Tree

```
Am I accepting external input?
├─ Yes → Validate immediately (fail-fast)
└─ No → ✓

Could default values cause problems?
├─ Yes → Use safe, conservative defaults
└─ No → ✓

Am I logging/storing sensitive data?
├─ Yes → Mask or omit (least privilege)
└─ No → ✓

Am I catching exceptions?
├─ Yes → Re-raise with context, never swallow
└─ No → ✓
```

## Anti-Patterns to Avoid

| Anti-Pattern          | Problem          | Solution              |
| --------------------- | ---------------- | --------------------- |
| Silent `except: pass` | Hidden bugs      | Re-raise with context |
| `debug=True` default  | Security risk    | Default to False      |
| `timeout=None`        | Infinite hang    | Set reasonable limit  |
| Logging passwords     | Security breach  | Never log secrets     |
| Late validation       | Confusing errors | Validate immediately  |
