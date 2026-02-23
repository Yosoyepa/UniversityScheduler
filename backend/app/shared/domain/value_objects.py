"""
Shared Value Objects.

Value objects are immutable objects defined by their attributes, not identity.
They enforce domain invariants at construction time (fail-fast principle).

Following defensive_programming skill: validate immediately, raise on invalid input.
Following solid_principles skill: immutable (frozen=True), single responsibility.
"""
from dataclasses import dataclass
from datetime import time
from enum import IntEnum
import re


class DayOfWeek(IntEnum):
    """
    Day of week enumeration.
    Uses ISO 8601 convention: Monday=1, Sunday=7.
    """
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7
    
    @property
    def name_es(self) -> str:
        """Spanish name of the day."""
        names = {
            1: "Lunes",
            2: "Martes",
            3: "Miércoles",
            4: "Jueves",
            5: "Viernes",
            6: "Sábado",
            7: "Domingo",
        }
        return names[self.value]
    
    @property
    def name_en(self) -> str:
        """English name of the day."""
        names = {
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
            7: "Sunday",
        }
        return names[self.value]


@dataclass(frozen=True)
class Email:
    """
    Email value object with validation.
    
    Immutable and validates format at construction.
    
    Raises:
        ValueError: If email format is invalid
    """
    value: str
    
    def __post_init__(self):
        # Fail-fast validation
        if not self.value:
            raise ValueError("Email cannot be empty")
        
        # Basic email regex (covers 99% of cases without being overly complex - KISS)
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, self.value):
            raise ValueError(f"Invalid email format: {self.value}")
    
    def __str__(self) -> str:
        return self.value
    
    @property
    def domain(self) -> str:
        """Extract domain from email."""
        return self.value.split("@")[1]
    
    @property
    def local_part(self) -> str:
        """Extract local part (before @) from email."""
        return self.value.split("@")[0]


@dataclass(frozen=True)
class TimeRange:
    """
    Time range value object representing a start and end time.
    
    Used for class sessions to validate time integrity and detect overlaps.
    Immutable and validates that end > start at construction.
    
    Raises:
        ValueError: If end_time is not greater than start_time
    """
    start_time: time
    end_time: time
    
    def __post_init__(self):
        # Fail-fast: validate time order
        if self.end_time <= self.start_time:
            raise ValueError(
                f"end_time ({self.end_time}) must be after start_time ({self.start_time})"
            )
    
    @property
    def duration_minutes(self) -> int:
        """Calculate duration in minutes."""
        start_minutes = self.start_time.hour * 60 + self.start_time.minute
        end_minutes = self.end_time.hour * 60 + self.end_time.minute
        return end_minutes - start_minutes
    
    def overlaps(self, other: "TimeRange") -> bool:
        """
        Check if this time range overlaps with another.
        
        Overlap occurs when:
        - This starts before other ends, AND
        - This ends after other starts
        
        Adjacent ranges (e.g., 10:00-11:00 and 11:00-12:00) do NOT overlap.
        
        Args:
            other: Another TimeRange to check against
            
        Returns:
            True if ranges overlap, False otherwise
        """
        return self.start_time < other.end_time and self.end_time > other.start_time
    
    def overlap_minutes(self, other: "TimeRange") -> int:
        """
        Calculate the number of overlapping minutes with another range.
        
        Returns:
            Number of overlapping minutes (0 if no overlap)
        """
        if not self.overlaps(other):
            return 0
        
        overlap_start = max(self.start_time, other.start_time)
        overlap_end = min(self.end_time, other.end_time)
        
        start_minutes = overlap_start.hour * 60 + overlap_start.minute
        end_minutes = overlap_end.hour * 60 + overlap_end.minute
        
        return end_minutes - start_minutes
    
    def __str__(self) -> str:
        return f"{self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')}"


@dataclass(frozen=True)
class HexColor:
    """
    Hexadecimal color value object.
    
    Validates hex color format (#RRGGBB or #RGB).
    """
    value: str
    
    DEFAULT = "#3b82f6"  # Default blue color
    
    def __post_init__(self):
        if not self.value:
            # Use object.__setattr__ because frozen=True
            object.__setattr__(self, 'value', self.DEFAULT)
            return
            
        # Normalize: ensure it starts with #
        normalized = self.value if self.value.startswith('#') else f'#{self.value}'
        
        # Validate format
        if not re.match(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', normalized):
            raise ValueError(f"Invalid hex color format: {self.value}")
        
        object.__setattr__(self, 'value', normalized.lower())
    
    def __str__(self) -> str:
        return self.value
