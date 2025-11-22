from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FlashCard, FlashCardDeck
from .serializers import (
    FlashCardAbacusSessionRequestSerializer,
    FlashCardAbacusSessionResponseSerializer,
    FlashCardDeckSerializer,
    FlashCardSessionRequestSerializer,
    FlashCardSessionResponseSerializer,
)
from .services import generate_flashcards_abacus_session

import random


class FlashCardDeckQuerysetMixin:
    def get_queryset(self):
        base_qs = FlashCardDeck.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                "cards",
                queryset=FlashCard.objects.filter(is_active=True).order_by("order", "id"),
            )
        ).order_by("order", "title")
        return base_qs


class FlashCardDeckListView(FlashCardDeckQuerysetMixin, ListAPIView):
    serializer_class = FlashCardDeckSerializer


class FlashCardDeckDetailView(FlashCardDeckQuerysetMixin, RetrieveAPIView):
    serializer_class = FlashCardDeckSerializer
    lookup_field = "slug"


class FlashCardSessionView(APIView):
    def post(self, request, *args, **kwargs):
        request_serializer = FlashCardSessionRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        deck_slug = request_serializer.validated_data["deck_slug"]
        speed = request_serializer.validated_data["speed"]
        requested_count = request_serializer.validated_data["word_count"]

        deck = get_object_or_404(FlashCardDeck, slug=deck_slug)

        cards_qs = deck.cards.filter(is_active=True).order_by("order", "id")
        available_cards = list(cards_qs)

        if not available_cards:
            return Response(
                {"detail": "В выбранном наборе пока нет активных карточек."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        max_words = len(available_cards)
        if requested_count > max_words:
            requested_count = max_words

        selected_cards = available_cards.copy()
        random.shuffle(selected_cards)
        selected_cards = selected_cards[:requested_count]

        sequence = [
            {"id": card.id, "text": card.front_text}
            for card in selected_cards
        ]

        recall_cards = sequence.copy()
        random.shuffle(recall_cards)

        response_payload = {
            "deck": {
                "slug": deck.slug,
                "title": deck.title,
                "accent_color": deck.accent_color,
            },
            "speed": speed,
            "word_count": len(sequence),
            "sequence": sequence,
            "recall": recall_cards,
        }

        response_serializer = FlashCardSessionResponseSerializer(response_payload)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class FlashCardAbacusSessionView(APIView):
    def post(self, request, *args, **kwargs):
        request_serializer = FlashCardAbacusSessionRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        session_payload = generate_flashcards_abacus_session(
            difficulty=request_serializer.validated_data["difficulty"],
            speed=request_serializer.validated_data["speed"],
            quantity=request_serializer.validated_data["quantity"],
            max_digit=request_serializer.validated_data["max_digit"],
        )

        response_serializer = FlashCardAbacusSessionResponseSerializer(session_payload)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
