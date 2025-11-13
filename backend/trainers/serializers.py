from typing import List

from django.core.exceptions import FieldDoesNotExist
from rest_framework import serializers

from .models import Trainer


class TrainerSerializer(serializers.ModelSerializer):
    difficulties = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        extra_kwargs = {
            "external_url": {"allow_blank": True, "allow_null": True, "required": False},
        }
        fields = [
            "id",
            "slug",
            "title",
            "lead",
            "image",
            "external_url",
            "program",
            "accent_color",
            "position",
            "is_active",
            "difficulties",
        ]

    def get_difficulties(self, trainer: Trainer) -> List[dict]:
        if trainer.slug == "stroop-test":
            from trainers_stroop.views import DIFFICULTIES

            difficulties: List[dict] = []
            for order, (slug, config) in enumerate(DIFFICULTIES.items(), start=1):
                mismatch_ratio = int(round(config["mismatch_ratio"] * 100))
                difficulties.append(
                    {
                        "id": order,
                        "title": f'{config["rounds"]} раундов — уровень «{slug}»',
                        "word_count": config["rounds"],
                        "sample_text": (
                            f'Рекомендуемое время: {config["recommended_seconds"]} сек. '
                            f"Несовпадений: {mismatch_ratio}%"
                        ),
                        "order": order,
                        "is_active": True,
                    }
                )
            return difficulties

        providers = {
            "fading-text": (
                "trainers_fading_text.models",
                "FadingTextLevel",
                "trainers_fading_text.serializers",
                "FadingTextLevelSerializer",
                lambda qs: qs.order_by("order", "word_count"),
            ),
            "schulte-table": (
                "trainers_schulte_table.models",
                "SchulteTableLevel",
                "trainers_schulte_table.serializers",
                "SchulteTableLevelSerializer",
                lambda qs: qs.order_by("order", "grid_size"),
            ),
            "flash-words": (
                "trainers_flash_cards.models",
                "FlashCardDeck",
                "trainers_flash_cards.serializers",
                "FlashCardDeckDifficultySerializer",
                lambda qs: qs.filter(is_active=True).order_by("order", "title"),
            ),
        }

        provider = providers.get(trainer.slug)
        if not provider:
            return []

        model_module_path, model_name, serializer_module_path, serializer_name, ordering = provider

        model_module = __import__(model_module_path, fromlist=[model_name])
        model_cls = getattr(model_module, model_name)

        serializer_module = __import__(serializer_module_path, fromlist=[serializer_name])
        serializer_cls = getattr(serializer_module, serializer_name)

        queryset = model_cls.objects.filter(trainer=trainer)
        try:
            model_cls._meta.get_field("is_active")
        except FieldDoesNotExist:
            pass
        else:
            queryset = queryset.filter(is_active=True)
        queryset = ordering(queryset)
        return serializer_cls(queryset, many=True).data
