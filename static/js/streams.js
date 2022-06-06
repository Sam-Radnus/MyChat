const APP_ID = '121ed57cbab846018e6a35749de3c958'
const CHANNEL = 'main'
const TOKEN = '006121ed57cbab846018e6a35749de3c958IACjgCN9jmIwZXP0pN7DzwAjtQfv20ic8iGnEArOl2UNIGTNKL8AAAAAEACXVkQugiKeYgEAAQCDIp5i'
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let UID;
let localTracks = [] //audio and video tracks
let remoteUsers = {}
let joinAndDisplayLocalStream = async () => {
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null) //helps to join a channel 
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()//take audio and video tracks from user
    
    let player =`
    <div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span class="user-name">My Name</span></div>
    <div class="video-player" id="user-${UID}">
    </div>
    </div> 
                `
    
    
   document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)   
   console.log(document.getElementById('video-streams'))
   localTracks[1].play(`user-${UID}`)//creates a video where our video will be displayed       

   await client.publish([localTracks[0],localTracks[1]]) //helps others see the video 
}

joinAndDisplayLocalStream()