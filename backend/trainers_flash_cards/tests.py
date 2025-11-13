from django.urls import reverse
from rest_framework.test import APIClient, APITestCase

from trainers.models import Trainer

from .models import FlashCard, FlashCardDeck


class FlashCardDeckApiTests(APITestCase):
    def setUp(self) -> None:
        self.trainer = Trainer.objects.get(slug='flash-words')
        self.deck = FlashCardDeck.objects.create(
            slug='basic-phrases',
            title='Базовые фразы',
            description='Простые выражения для тренировки памяти.',
            accent_color='#FF9F68',
            trainer=self.trainer,
            order=1,
        )
        FlashCard.objects.create(
            deck=self.deck,
            front_text='Hello',
            back_text='Привет',
            order=1,
        )
        FlashCard.objects.create(
            deck=self.deck,
            front_text='Bye',
            back_text='Пока',
            order=2,
        )
        self.client = APIClient()

    def test_deck_list_returns_cards(self) -> None:
        url = reverse('flashcard-deck-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)
        deck_payload = next((item for item in response.data if item['slug'] == self.deck.slug), None)
        self.assertIsNotNone(deck_payload)
        self.assertEqual(len(deck_payload['cards']), 2)

    def test_deck_detail(self) -> None:
        url = reverse('flashcard-deck-detail', kwargs={'slug': self.deck.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], self.deck.slug)
        self.assertEqual(len(response.data['cards']), 2)

    def test_session_endpoint(self) -> None:
        url = reverse('flashcard-session')
        response = self.client.post(
            url,
            {
                'deck_slug': self.deck.slug,
                'speed': 0.8,
                'word_count': 2,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['deck']['slug'], self.deck.slug)
        self.assertEqual(response.data['word_count'], 2)
        self.assertEqual(len(response.data['sequence']), 2)
        self.assertEqual(len(response.data['recall']), 2)
