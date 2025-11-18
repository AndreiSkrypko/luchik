from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    SimplySessionRequestSerializer,
    SimplySessionResponseSerializer,
)
from .services import generate_simply_sequence


class SimplySessionAPIView(APIView):
    """Генерация последовательности чисел для тренажера «Просто»."""

    def post(self, request, *args, **kwargs):
        request_serializer = SimplySessionRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        range_key = int(request_serializer.validated_data["range_key"])
        num_examples = int(request_serializer.validated_data["num_examples"])
        speed = float(request_serializer.validated_data["speed"])
        max_digit = int(request_serializer.validated_data["max_digit"])

        numbers, total, max_sum, config = generate_simply_sequence(
            range_key=range_key,
            num_examples=num_examples,
            max_digit=max_digit,
        )

        payload = {
            "settings": {
                "range_key": config.key,
                "range_label": config.label,
                "num_examples": num_examples,
                "speed": speed,
                "max_digit": max_digit,
                "max_sum": max_sum,
            },
            "numbers": [
                {"index": idx + 1, "value": value} for idx, value in enumerate(numbers)
            ],
            "total": total,
        }

        response_serializer = SimplySessionResponseSerializer(payload)
        return Response(response_serializer.data)

