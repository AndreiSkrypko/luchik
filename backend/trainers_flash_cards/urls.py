from django.urls import path

from .views import (
    FlashCardAbacusSessionView,
    FlashCardDeckDetailView,
    FlashCardDeckListView,
    FlashCardSessionView,
)

urlpatterns = [
    path('decks/', FlashCardDeckListView.as_view(), name='flashcard-deck-list'),
    path('decks/<slug:slug>/', FlashCardDeckDetailView.as_view(), name='flashcard-deck-detail'),
    path('session/', FlashCardSessionView.as_view(), name='flashcard-session'),
    path('abacus/session/', FlashCardAbacusSessionView.as_view(), name='flashcard-abacus-session'),
]
