const APP_ID = '121ed57cbab846018e6a35749de3c958'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let NAME=sessionStorage.getItem('username')
let UID=Number(sessionStorage.getItem('UID'));
let localTracks = [] //audio and video tracks
let remoteUsers = {}
console.log(TOKEN);
let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText=CHANNEL;

    client.on('user-published', handleUserJoined)
    client.on('user-left',handleUserLeft)
    try{  
      await client.join(APP_ID, CHANNEL, TOKEN, UID) //helps to join a channel 
    }
    catch(error)
    {
        console.error(error);
        window.open('/','_self');
    }
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()//take audio and video tracks from user
    let member=await createMember();
    let player = `
               <div class="video-container" id="user-container-${UID}">
               <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
               <div class="video-player" id="user-${UID}">
               </div>
               </div> 
                `
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    console.log(document.getElementById('video-streams'))
    localTracks[1].play(`user-${UID}`)//creates a video where our video will be displayed       

    await client.publish([localTracks[0], localTracks[1]]) //helps others see the video 
}
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)  //subscribe to the added user

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)//if the user doesnt already exists
        if (player != null) {
            player.remove();
        }
        let member=await getMember(user)
         player = `
                 <div class="video-container" id="user-container-${user.uid}">
                 <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                 <div class="video-player" id="user-${user.uid}">
                 </div>
                 </div> 
                `
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player) //append the user 
        user.videoTrack.play(`user-${user.uid}`)  //play the track 
    }
    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}
let handleUserLeft=async(user)=>{
    delete remoteUsers[user.uid];
    document.getElementById(`user-container-${user.uid}`).remove();
}
let leaveAndRemoveLocalStream=async()=>{
    //we are going to the localTracks and stop the video and audio for the user the clicked the video and unsubscribe
    for(let i=0 ;i<localTracks.length;i++)
    {
        localTracks[i].stop()//pauses it can be reopened 
        localTracks[i].close()
    }
    deleteMember()
    await client.leave();
    window.open('/','_self')
}

let toggleCamera=async(e)=>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false);
        e.target.style.backgroundColor='#fff';
    }
    else{
        await localTracks[1].setMuted(true);
        e.target.style.backgroundColor='#FF5050';
    }
}
let toggleAudio=async(e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false);
        mRtcEngine.setAudioProfile(Constants.AUDIO_PROFILE_MUSIC_STANDARD_STEREO, Constants.AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT);
        e.target.style.backgroundColor='#fff';
    }
    else{
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor='#FF5050';
    }
}
let createMember=async()=>{
    let response=await fetch('/create_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'room_name':CHANNEL,'UID':UID})
    })
    let member=await response.json()
    return member;
}
let deleteMember=async()=>{
    let response=await fetch('/delete_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'room_name':CHANNEL,'UID':UID})
    })
    let member=await response.json();
}
let getMember=async(user)=>{
    let response=await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member=await response.json()
    return member;
}
window.addEventListener('beforeunload',deleteMember)
joinAndDisplayLocalStream()
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click',toggleCamera);
document.getElementById('mic-btn').addEventListener('click',toggleAudio);
