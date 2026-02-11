from django.contrib.auth.models import User, Group

from rest_framework import serializers


class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name"]


class UserSerializer(serializers.ModelSerializer):
    groups = UserGroupSerializer(many=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "last_login",
            "groups",
            "is_active",
        ]


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name"]


class SimpleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name"]


class GroupUserSerializer(UserSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class GroupSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()
    users = GroupUserSerializer(source="user_set", many=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = Group
        exclude = ["permissions"]

    def get_user_count(self, obj):
        return obj.user_set.count()

    def get_roles(self, obj):
        return [g.role for g in obj.globalrolebinding_set.all()]


class NewGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        exclude = ["permissions"]


class UpdateGroupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=64)

    class Meta:
        model = Group
        fields = ["name"]


class NewUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "first_name", "last_name", "email"]

    def create(self, validated_data):
        """
        Create a new user with a hashed password.
        """
        user = User.objects.create_user(**validated_data)
        return user


class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Check that the two passwords match.
        """
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError("Passwords do not match")
        return data
