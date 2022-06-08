from tkinter.font import ROMAN
from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
from .models import RoomMember
import random
import time
import json
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
def getToken(request):
    appId='121ed57cbab846018e6a35749de3c958'
    appCertificate='e1fa812ee89948a0b5b35b2938f4103c'
    channelName=request.GET.get('channel')
    uid=random.randint(1,230)
    expirationTimeInSeconds=3600*48
    currentTimeStamp=time.time()
    privilegeExpiredTs=currentTimeStamp+expirationTimeInSeconds
    role=1
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)
def lobby(request):
    return render(request,'base/lobby.html')

def room(request):
    return render(request,'base/room.html')
@csrf_exempt
def createUser(request):
    data = json.loads(request.body)#get the data from the front end
    member,created=RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],#check if user exists based on their UID
        room_name=data['room_name']
    )

    return JsonResponse({'name':data['name']},safe=False)#setting the safe parameter to False actually influences JSON to receive any Python Data Type.

def getMember(request):
    uid=request.GET.get('UID')
    room_name=request.GET.get('room_name')
    member=RoomMember.objects.get(  #get all the members in a conference by UID and Room_name
        uid=uid,
        room_name=room_name,
    )
    name=member.name
    return JsonResponse({'name':member.name},safe=False)

@csrf_exempt
def deleteUser(request):
    data = json.loads(request.body)#get the data from the front end
    member=RoomMember.objects.get(
        uid=data['UID'],#check if user exists based on their UID
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member was Deleted',safe=False)#setting the safe parameter to False actually influences JSON to receive any Python Data Type.
