from django.urls import path
from . import views # . denotes file is from same folder
urlpatterns=[
   path('',views.lobby),
   path('room',views.room),
   path('get_token/',views.getToken)
]