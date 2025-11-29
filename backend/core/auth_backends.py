# core/auth_backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class CaseInsensitiveUsernameBackend(ModelBackend):
    """
    Auth backend that treats username lookup as case-insensitive.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Case-insensitive username lookup
        try:
            user = UserModel.objects.get(username__iexact=username)
        except UserModel.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
