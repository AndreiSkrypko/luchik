from django.contrib import admin

from .models import FlashCard, FlashCardDeck


class FlashCardInline(admin.TabularInline):
    model = FlashCard
    extra = 1
    fields = ("front_text", "back_text", "hint", "order", "is_active")
    show_change_link = True


@admin.register(FlashCardDeck)
class FlashCardDeckAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "card_count", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [FlashCardInline]

    def card_count(self, obj: FlashCardDeck) -> int:
        return obj.cards.count()

    card_count.short_description = "Карточек"


@admin.register(FlashCard)
class FlashCardAdmin(admin.ModelAdmin):
    list_display = ("short_front", "deck", "order", "is_active", "updated_at")
    list_filter = ("deck", "is_active")
    search_fields = ("front_text", "back_text", "hint")
    autocomplete_fields = ("deck",)
    ordering = ("deck", "order", "id")

    def short_front(self, obj: FlashCard) -> str:
        return obj.front_text[:64] + ("..." if len(obj.front_text) > 64 else "")

    short_front.short_description = "Лицевая сторона"
