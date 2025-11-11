from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Course, Contact
from .serializers import CourseSerializer, ContactSerializer


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра курсов"""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра контактов"""

    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


@api_view(['GET'])
def home_data(request):
    """Endpoint для получения данных главной страницы"""

    data = {
        'center_name': 'Детский центр Лучик',
        'tagline': 'Место, где каждый ребенок — маленькая звезда!',
        'description': 'Развиваем таланты, воспитываем характер, дарим радость!',
        'features': [
            {'icon': '🎨', 'title': 'Творчество', 'description': 'Рисование, лепка, музыка'},
            {'icon': '📚', 'title': 'Обучение', 'description': 'Подготовка к школе, иностранные языки'},
            {'icon': '🤸', 'title': 'Спорт', 'description': 'Танцы, гимнастика, йога'},
            {'icon': '🎭', 'title': 'Театр', 'description': 'Актерское мастерство, постановки'},
        ],
    }
    return Response(data)
