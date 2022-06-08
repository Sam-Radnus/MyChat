const APP_ID = '121ed57cbab846018e6a35749de3c958'
const CHANNEL = 'main'
const TOKEN = '0061c2e95229d05495ead990269f8fa0414IAD+HSyQJSXB70brmQnda1iISoh/d3CAOTebthZZ7AlBMmTNKL8AAAAAEAA9DfJzMdegYgEAAQA216Bi'
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let UID;
let localTracks = [] //audio and video tracks
let remoteUsers = {}
console.log(TOKEN);
let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left',handleUserLeft)
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null) //helps to join a channel 
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()//take audio and video tracks from user

    let player = `
               <div class="video-container" id="user-container-${UID}">
               <div class="username-wrapper"><span class="user-name">My Name</span></div>
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
         player = `
                 <div class="video-container" id="user-container-${user.uid}">
                 <div class="username-wrapper"><span class="user-name">My Name</span></div>
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
        e.target.style.backgroundColor='#fff';
    }
    else{
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor='#FF5050';
    }
}
joinAndDisplayLocalStream()
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click',toggleCamera);
document.getElementById('mic-btn').addEventListener('click',toggleAudio);
