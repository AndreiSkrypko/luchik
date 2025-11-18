from rest_framework import serializers


class SimplySessionRequestSerializer(serializers.Serializer):
    range_key = serializers.ChoiceField(choices=[(1, "1-10"), (2, "10-100"), (3, "100-1000"), (4, "1000-10000")], default=2)
    num_examples = serializers.IntegerField(min_value=2, max_value=99, default=10)
    speed = serializers.FloatField(min_value=0.1, max_value=10, default=1.0)
    max_digit = serializers.IntegerField(min_value=2, max_value=9, default=9)


class SimplyNumberSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    value = serializers.IntegerField()


class SimplySettingsSerializer(serializers.Serializer):
    range_key = serializers.IntegerField()
    range_label = serializers.CharField()
    num_examples = serializers.IntegerField()
    speed = serializers.FloatField()
    max_digit = serializers.IntegerField()
    max_sum = serializers.IntegerField()


class SimplySessionResponseSerializer(serializers.Serializer):
    settings = SimplySettingsSerializer()
    numbers = SimplyNumberSerializer(many=True)
    total = serializers.IntegerField()

