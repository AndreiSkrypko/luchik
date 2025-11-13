from rest_framework import serializers

from .models import FlashCard, FlashCardDeck


class FlashCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashCard
        fields = ("id", "front_text", "back_text", "hint", "order")


class FlashCardDeckSerializer(serializers.ModelSerializer):
    cards = FlashCardSerializer(many=True, read_only=True)

    class Meta:
        model = FlashCardDeck
        fields = (
            "id",
            "slug",
            "title",
            "description",
            "accent_color",
            "is_active",
            "order",
            "cards",
        )


class FlashCardDeckDifficultySerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()
    sample_text = serializers.SerializerMethodField()

    class Meta:
        model = FlashCardDeck
        fields = (
            "id",
            "title",
            "is_active",
            "order",
            "word_count",
            "sample_text",
        )

    def get_word_count(self, deck: FlashCardDeck) -> int:
        return deck.cards.filter(is_active=True).count()

    def get_sample_text(self, deck: FlashCardDeck) -> str:
        words = list(deck.cards.filter(is_active=True).order_by("order", "id").values_list("front_text", flat=True))
        return ", ".join(words)


class FlashCardSessionRequestSerializer(serializers.Serializer):
    deck_slug = serializers.SlugField()
    speed = serializers.FloatField(min_value=0.05, max_value=4.0)
    word_count = serializers.IntegerField(min_value=2)


class FlashCardSessionCardSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()


class FlashCardSessionResponseSerializer(serializers.Serializer):
    deck = serializers.DictField()
    speed = serializers.FloatField()
    word_count = serializers.IntegerField()
    sequence = FlashCardSessionCardSerializer(many=True)
    recall = FlashCardSessionCardSerializer(many=True)
