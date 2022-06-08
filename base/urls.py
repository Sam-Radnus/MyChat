from django.urls import path
from . import views # . denotes file is from same folder
urlpatterns=[
   path('',views.lobby),
   path('room',views.room),
   path('get_token/',views.getToken),
   path('create_member/',views.createUser),
   path('get_member/',views.getMember),
   path('delete_member/',views.deleteUser)
]