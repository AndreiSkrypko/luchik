import random
from dataclasses import dataclass
from typing import Dict, List


DIFFICULTY_RANGES: Dict[int, tuple[int, int]] = {
    1: (0, 10),
    2: (10, 100),
    3: (100, 1000),
    4: (1000, 10000),
}

DIFFICULTY_LABELS: Dict[int, str] = {
    1: "1–10",
    2: "10–100",
    3: "100–1000",
    4: "1000–10000",
}


@dataclass
class AbacusColumn:
    upper_active: bool
    lower_active_count: int


def _digit_to_abacus_column(digit: int) -> AbacusColumn:
    if digit < 0 or digit > 9:
        raise ValueError("Digit must be between 0 and 9")

    upper_active = digit >= 5
    lower_active_count = digit - 5 if upper_active else digit

    return AbacusColumn(upper_active=upper_active, lower_active_count=lower_active_count)


def _number_to_columns(number: int) -> List[AbacusColumn]:
    if number == 0:
        return [_digit_to_abacus_column(0)]

    digits = [int(char) for char in str(number)]
    return [_digit_to_abacus_column(digit) for digit in digits]


def _generate_number(difficulty: int, max_digit: int) -> int:
    digits_count = max(1, min(4, difficulty))
    digits: List[str] = []

    for position in range(digits_count):
        min_digit = 1 if digits_count > 1 and position == 0 else 0
        min_digit = min(min_digit, max_digit)
        digit = random.randint(min_digit, max_digit)
        digits.append(str(digit))

    value = int("".join(digits))
    min_value, max_value = DIFFICULTY_RANGES.get(difficulty, (0, 10))

    if value < min_value:
        return min_value
    if value >= max_value:
        return max_value - 1
    return value


def generate_flashcards_abacus_session(
    difficulty: int,
    speed: float,
    quantity: int,
    max_digit: int,
) -> Dict:
    numbers: List[int] = []

    for _ in range(quantity):
        number = _generate_number(difficulty, max_digit)
        numbers.append(number)

    total = sum(numbers)
    cards = [
        {
            "index": idx + 1,
            "value": value,
            "columns": [
                {
                    "upper_active": column.upper_active,
                    "lower_active_count": column.lower_active_count,
                }
                for column in _number_to_columns(value)
            ],
        }
        for idx, value in enumerate(numbers)
    ]

    settings = {
        "difficulty": difficulty,
        "difficulty_label": DIFFICULTY_LABELS.get(difficulty, "1–10"),
        "quantity": quantity,
        "max_digit": max_digit,
    }

    return {
        "settings": settings,
        "cards": cards,
        "numbers": numbers,
        "total": total,
        "speed": speed,
    }

