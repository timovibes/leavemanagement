from django.urls import path
from .views import (
    MyNotificationsView, MarkNotificationReadView,
    MarkAllReadView, UnreadCountView
)

urlpatterns = [
    path('', MyNotificationsView.as_view(), name='my_notifications'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark_all_read'),
    path('unread-count/', UnreadCountView.as_view(), name='unread_count'),
]