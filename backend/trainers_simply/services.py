from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, List, Tuple

RANGE_LABELS: Dict[int, str] = {
    1: "от 1 до 10",
    2: "от 10 до 100",
    3: "от 100 до 1000",
    4: "от 1000 до 10000",
}


@dataclass(frozen=True)
class RangeConfig:
    key: int
    label: str
    min_value: int
    max_value: int
    digits: int


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def repeat_digit(digit: int, digits: int) -> int:
    return int(str(digit) * digits)


def resolve_range(range_key: int, max_digit: int) -> Tuple[RangeConfig, int]:
    """Возвращает конфигурацию диапазона и максимально возможную сумму."""
    range_key = int(clamp(range_key, 1, 4))
    max_digit = int(clamp(max_digit, 2, 9))

    if range_key == 1:
        config = RangeConfig(range_key, RANGE_LABELS[1], 1, 9, 1)
        max_sum = max_digit
        return config, max_sum

    if range_key == 2:
        effective_max = repeat_digit(max_digit, 2)
        config = RangeConfig(range_key, RANGE_LABELS[2], 10, min(99, effective_max), 2)
        return config, effective_max

    if range_key == 3:
        effective_max = repeat_digit(max_digit, 3)
        config = RangeConfig(range_key, RANGE_LABELS[3], 100, min(999, effective_max), 3)
        return config, effective_max

    effective_max = repeat_digit(max_digit, 4)
    config = RangeConfig(range_key, RANGE_LABELS[4], 1000, min(9999, effective_max), 4)
    return config, effective_max


def generate_abacus_numbers(max_digit: int, num_examples: int) -> List[int]:
    """
    Генерирует последовательность по правилам абакуса (для однозначных чисел).
    Логика перенесена из оригинального проекта mental_final_new.
    """

    max_digit = int(clamp(max_digit, 2, 9))
    numbers: List[int] = []
    current_sum = 0
    abacus_state = [False, 0]  # [есть ли пятерка, количество единичных косточек]

    def get_valid_operations(current_state, max_intermediate_sum):
        operations = []
        has_five, units = current_state

        if max_digit >= 5:
            if not has_five:
                operations.append(("+", 5))
            else:
                operations.append(("-", 5))

        max_units = min(4, max_digit) if max_digit < 5 else 4
        for i in range(1, max_units + 1):
            if units + i <= 4:
                operations.append(("+", i))
            if units - i >= 0:
                operations.append(("-", i))

        if max_digit > 5:
            operations.append(("+", max_digit))
            operations.append(("-", max_digit))

        valid_operations = []
        for sign, value in operations:
            new_sum = current_sum + (value if sign == "+" else -value)
            if 0 <= new_sum <= max_intermediate_sum:
                valid_operations.append((sign, value))
        return valid_operations

    def get_weighted_operations(valid_ops):
        weighted_ops = []
        for op in valid_ops:
            sign, value = op
            if value == max_digit:
                weight = 6 if max_digit == 9 else 5 if max_digit == 4 else 4
                weighted_ops.extend([op] * weight)
            elif value == 5 and max_digit >= 5:
                weighted_ops.extend([op] * 2)
            else:
                weighted_ops.append(op)
        return weighted_ops

    for _ in range(num_examples):
        valid_ops = get_valid_operations(abacus_state, 9)
        if not valid_ops:
            abacus_state = [False, 0]
            current_sum = 0
            valid_ops = get_valid_operations(abacus_state, 9)

        if not valid_ops:
            safe_value = min(1, max_digit)
            numbers.append(safe_value)
            current_sum += safe_value
            abacus_state[1] = min(4, abacus_state[1] + safe_value)
            continue

        weighted_ops = get_weighted_operations(valid_ops)
        sign, value = random.choice(weighted_ops)

        if value == 5:
            abacus_state[0] = sign == "+"
        elif value > 5:
            pass
        else:
            if sign == "+":
                abacus_state[1] += value
            else:
                abacus_state[1] -= value

        final_number = value if sign == "+" else -value
        numbers.append(final_number)
        current_sum += final_number

    total_sum = sum(numbers)
    if total_sum > max_digit:
        correction = max_digit - total_sum
        if correction:
            numbers.append(correction)

    return numbers


def generate_simply_sequence(range_key: int, num_examples: int, max_digit: int) -> Tuple[List[int], int, int, RangeConfig]:
    """
    Главная функция генерации чисел. Возвращает последовательность чисел, итоговую сумму,
    максимально возможную сумму и конфигурацию диапазона.
    """

    max_digit = int(clamp(max_digit, 2, 9))
    num_examples = int(clamp(num_examples, 2, 99))
    config, max_sum = resolve_range(range_key, max_digit)

    if config.key == 1 and max_digit >= 5:
        numbers = generate_abacus_numbers(max_digit, num_examples)
        return numbers, sum(numbers), max_sum, config

    numbers: List[int] = []
    num_digits = config.digits
    min_num = config.min_value
    max_num = config.max_value
    target_sum = random.randint(0, max_sum)

    current_sum = 0
    i = 0
    max_attempts = 1000

    while i < num_examples:
        attempts = 0
        while attempts < max_attempts:
            attempts += 1

            number = 0
            valid_number = True
            for digit_pos in range(num_digits):
                available_first_digits = list(range(1, min(max_digit + 1, 10)))
                if not available_first_digits:
                    valid_number = False
                    break
                digit = random.choice(available_first_digits)
                number += digit * (10 ** (num_digits - 1 - digit_pos))

            if not valid_number:
                continue

            if not (min_num <= number <= max_num):
                continue

            remaining_numbers = num_examples - i - 1

            if i == num_examples - 1:
                needed_value = target_sum - current_sum
                if abs(needed_value) == number:
                    sign = 1 if needed_value > 0 else -1
                    temp_sum = current_sum + (number * sign)
                    if 0 <= temp_sum <= max_sum:
                        final_number = number * sign
                        numbers.append(final_number)
                        current_sum += final_number
                        break
                continue

            possible_signs = []
            temp_sum_pos = current_sum + number
            if 0 <= temp_sum_pos <= max_sum:
                remaining_range = remaining_numbers * max_num
                if temp_sum_pos - remaining_range <= target_sum <= temp_sum_pos + remaining_range:
                    possible_signs.append(1)

            temp_sum_neg = current_sum - number
            if 0 <= temp_sum_neg <= max_sum:
                remaining_range = remaining_numbers * max_num
                if temp_sum_neg - remaining_range <= target_sum <= temp_sum_neg + remaining_range:
                    possible_signs.append(-1)

            if possible_signs:
                sign = random.choice(possible_signs)
                final_number = number * sign
                numbers.append(final_number)
                current_sum += final_number
                break

        if attempts >= max_attempts:
            numbers = []
            current_sum = 0
            target_sum = random.randint(0, max_sum)
            i = 0
            continue

        i += 1

    if len(numbers) != num_examples:
        numbers = []
        current_sum = 0
        for _ in range(num_examples):
            number = 0
            for digit_pos in range(num_digits):
                available_first_digits = list(range(1, min(max_digit + 1, 10)))
                digit = random.choice(available_first_digits) if available_first_digits else 1
                number += digit * (10 ** (num_digits - 1 - digit_pos))

            number = max(min_num, min(number, max_num))

            possible_signs = []
            if current_sum + number <= max_sum:
                possible_signs.append(1)
            if current_sum - number >= 0:
                possible_signs.append(-1)

            if not possible_signs:
                sign = 1
                if current_sum + number > max_sum:
                    number = max_sum - current_sum
                    if number < min_num:
                        number = min_num
            else:
                sign = random.choice(possible_signs)

            final_number = number * sign
            numbers.append(final_number)
            current_sum += final_number

            if current_sum < 0:
                current_sum = 0
            elif current_sum > max_sum:
                current_sum = max_sum

    total = sum(numbers)
    total = max(0, min(total, max_sum))
    return numbers, total, max_sum, config

