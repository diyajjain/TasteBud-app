from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    def validate_favorite_artists(self, value):
        # Accepts either list of strings or list of objects, always returns list of objects
        new_value = []
        for entry in value:
            if isinstance(entry, dict) and 'name' in entry:
                # Already in correct format
                new_value.append({
                    'id': entry.get('id', ''),
                    'name': entry['name'],
                    'image': entry.get('image', None)
                })
            elif isinstance(entry, str):
                new_value.append({'id': '', 'name': entry, 'image': None})
        return new_value

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'favorite_genres', 'favorite_artists', 'mood_preferences']
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 from the data
        validated_data.pop('password2')
        
        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        return user 