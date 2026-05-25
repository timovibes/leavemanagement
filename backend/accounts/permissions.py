from rest_framework.permissions import BasePermission


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'EMPLOYEE', 'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'
        ]


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'
        ]


class IsHROfficer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'HR_OFFICER', 'HEAD_HR', 'ADMIN'
        ]


class IsHeadHR(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'HEAD_HR', 'ADMIN'
        ]


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'