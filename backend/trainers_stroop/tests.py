from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse


class StroopSessionViewTests(APITestCase):
    def test_default_session_returns_rounds(self):
        response = self.client.get(reverse('stroop-session'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertEqual(payload['level'], 'normal')
        self.assertIn('rounds', payload)
        self.assertTrue(payload['rounds'])
        first_round = payload['rounds'][0]
        self.assertIn('word', first_round)
        self.assertIn('ink_color', first_round)
        self.assertIn('correct_answer', first_round)
        self.assertIn('choices', first_round)

    def test_unknown_level_returns_error(self):
        response = self.client.get(reverse('stroop-session'), {'level': 'unknown'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertIn('available_levels', payload)


