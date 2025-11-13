import random
from dataclasses import dataclass

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


@dataclass(frozen=True)
class StroopColor:
    name: str
    hex: str


COLORS: tuple[StroopColor, ...] = (
    StroopColor('красный', '#E74C3C'),
    StroopColor('синий', '#277BC0'),
    StroopColor('зелёный', '#27AE60'),
    StroopColor('жёлтый', '#F1C40F'),
    StroopColor('фиолетовый', '#8E44AD'),
    StroopColor('оранжевый', '#F39C12'),
)

DIFFICULTIES = {
    'easy': {
        'rounds': 12,
        'mismatch_ratio': 0.55,
        'recommended_seconds': 48,
    },
    'normal': {
        'rounds': 20,
        'mismatch_ratio': 0.7,
        'recommended_seconds': 60,
    },
    'hard': {
        'rounds': 30,
        'mismatch_ratio': 0.85,
        'recommended_seconds': 75,
    },
}


class StroopSessionView(APIView):
    """
    Формирует сессию для тренажера «Тест Струпа».

    Клиент получает последовательность карточек с цветами.
    Нужно выбрать цвет, которым написано слово, игнорируя его текст.
    """

    def get(self, request):
        difficulty_slug = request.query_params.get('level', 'normal').lower()
        config = DIFFICULTIES.get(difficulty_slug)

        if config is None:
            return Response(
                {
                    'detail': 'Недопустимый уровень сложности.',
                    'available_levels': list(DIFFICULTIES.keys()),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        rounds = self._build_rounds(config['rounds'], config['mismatch_ratio'])

        return Response(
            {
                'level': difficulty_slug,
                'total_rounds': len(rounds),
                'recommended_seconds': config['recommended_seconds'],
                'available_colors': [{'name': color.name, 'hex': color.hex} for color in COLORS],
                'rounds': rounds,
            }
        )

    def _build_rounds(self, total: int, mismatch_ratio: float) -> list[dict]:
        color_names = [color.name for color in COLORS]
        rounds: list[dict] = []

        for index in range(total):
            ink_color = random.choice(COLORS)
            should_mismatch = random.random() < mismatch_ratio

            if should_mismatch:
                mismatch_choices = [color for color in COLORS if color.name != ink_color.name]
                word_color = random.choice(mismatch_choices)
                word = word_color.name
            else:
                word = ink_color.name

            choices = self._build_choices(correct=ink_color.name, palette=color_names)

            rounds.append(
                {
                    'id': index + 1,
                    'word': word,
                    'ink_color': ink_color.hex,
                    'correct_answer': ink_color.name,
                    'choices': choices,
                }
            )

        return rounds

    @staticmethod
    def _build_choices(correct: str, palette: list[str]) -> list[str]:
        sample_size = min(4, len(palette))
        choices = set(random.sample(palette, k=sample_size))

        if correct not in choices:
            if len(choices) >= sample_size:
                choices.pop()
            choices.add(correct)

        choices_list = list(choices)
        random.shuffle(choices_list)
        return choices_list


