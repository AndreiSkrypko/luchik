from django.urls import path

from .views import FlashCardDeckDetailView, FlashCardDeckListView, FlashCardSessionView

urlpatterns = [
    path('decks/', FlashCardDeckListView.as_view(), name='flashcard-deck-list'),
    path('decks/<slug:slug>/', FlashCardDeckDetailView.as_view(), name='flashcard-deck-detail'),
    path('session/', FlashCardSessionView.as_view(), name='flashcard-session'),
]
