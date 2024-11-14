<template>
  <div>
    <v-btn @click="startConnection">연결 시작</v-btn>
    <v-btn @click="makeCall">영상 통화 걸기</v-btn>
    <v-btn @click="callAccept">통화 받기</v-btn>
    <v-text-field v-model="targetUUID" label="상대방 UUID" />
    <v-text-field v-model="token" label="token" />
    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>
    <div v-for="(log, index) in logs" :key="index">
      <p>{{ log }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

const logs = ref([])
const localVideo = ref(null)
const remoteVideo = ref(null)
const socket = io('http://127.0.0.1:4444') // 서버 주소
const targetUUID = ref('')
const token = ref('') // 로그인 후 얻은 토큰 사용
let remoteDescriptionPromise = null
const rtcPeerConnection = new RTCPeerConnection({
  iceServers: [
    {urls: `stun:43.201.148.2:3478`},
    {
      urls: `turn:43.201.148.2:3478`,
      username: "username",
      credential: "password"
    }
  ]
})

let localStream = null
let roomUUID = null

// 1. 연결 초기화 및 checkIn 이벤트 전송
const startConnection = async () => {
  console.log("startConnection 호출됨");

  socket.emit('checkIn', token.value);
  console.log("checkIn 이벤트 전송됨");

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("localStream 생성됨", localStream);
    localVideo.value.srcObject = localStream;

    localStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, localStream);
      console.log("localStream track 추가됨", track);
    });

    socket.on('arrivedCall', handleIncomingCall);
    socket.on('accepted', handleAccepted);
    socket.on('accept', handleAccept);
    socket.on('candidate', handleCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('callOver', handleCallOver);

  } catch (error) {
    console.error("startConnection 오류:", error);
  }
}

// 2. 통화 시작하기 (상대방 UUID로 sendCall 이벤트)
const makeCall = () => {
  if (targetUUID.value) {
    console.log("makeCall 호출됨. targetUUID:", targetUUID.value);
    socket.emit('sendCall', targetUUID.value);
  } else {
    console.warn("makeCall 호출됨, 그러나 targetUUID가 비어 있음");
  }
}

const callAccept = () => {
  console.log("callAccept 호출됨. targetUUID:", targetUUID.value);
  socket.emit('callAccept', targetUUID.value);
}

// 3. 상대방으로부터 통화 요청을 수락하는 함수
const handleIncomingCall = (callerUUID) => {
  logs.value.push(callerUUID)
  console.log("handleIncomingCall 호출됨. callerUUID:", callerUUID);
  // socket.emit('callAccept', callerUUID);
}

const handleAccepted = (receivedRoomUUID) => {
  console.log("handleAccepted 호출됨. receivedRoomUUID:", receivedRoomUUID);
  roomUUID = receivedRoomUUID;
  createOffer();
}
const handleAccept = (receivedRoomUUID) => {
  console.log("handleAccept 호출됨. receivedRoomUUID:", receivedRoomUUID);
  roomUUID = receivedRoomUUID;
}

const handleOffer = async (sdp) => {
  console.log("handleOffer 호출됨. sdp:", sdp);

  rtcPeerConnection.onicecandidate = onIceCandidate;
  rtcPeerConnection.ontrack = onAddStream;

  // localStream.getTracks().forEach(track => {
  //   rtcPeerConnection.addTrack(track, localStream);
  //   console.log("Track 추가됨:", track);
  // });

  if (rtcPeerConnection.signalingState === "stable") {
    try {
      remoteDescriptionPromise = rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      await remoteDescriptionPromise;
      console.log("Remote description 설정됨:", sdp);

      const answer = await rtcPeerConnection.createAnswer();
      await rtcPeerConnection.setLocalDescription(answer);
      console.log("Local description 설정됨:", answer);

      socket.emit("answer", { type: "answer", sdp: answer, room: roomUUID });
    } catch (error) {
      console.error("handleOffer 오류:", error);
    }
  }
}

const handleAnswer = async (sdp) => {
  console.log("handleAnswer 호출됨. sdp:", sdp);

  try {
    if (rtcPeerConnection.signalingState === "have-local-offer") {
      await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("Remote description 설정됨 (answer):", sdp);
    }
  } catch (error) {
    console.error("handleAnswer 오류:", error);
  }
}

const handleCandidate = (e) => {
  console.log("handleCandidate 호출됨. candidate 이벤트:", e);

  if (rtcPeerConnection) {
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: e.label,
      candidate: e.candidate,
    });

    if (remoteDescriptionPromise) {
      remoteDescriptionPromise
        .then(() => rtcPeerConnection.addIceCandidate(candidate))
        .then(() => console.log("ICE candidate 추가됨:", candidate))
        .catch(error => console.error("ICE candidate 추가 오류:", error));
    } else {
      rtcPeerConnection.addIceCandidate(candidate).catch(error => console.error("ICE candidate 추가 오류:", error));
    }
  }
}

// 4. Offer 생성 및 전송
const createOffer = async () => {
  console.log("createOffer 호출됨");

  rtcPeerConnection.onicecandidate = onIceCandidate;
  rtcPeerConnection.ontrack = onAddStream;

  // localStream.getTracks().forEach(track => {
  //   rtcPeerConnection.addTrack(track, localStream);
  //   console.log("Track 추가됨 (offer):", track);
  // });

  try {
    const offer = await rtcPeerConnection.createOffer();
    await rtcPeerConnection.setLocalDescription(offer);
    console.log("Local description 설정됨 (offer):", offer);

    socket.emit("offer", { type: "offer", sdp: offer, room: roomUUID });
  } catch (error) {
    console.error("createOffer 오류:", error);
  }
}

const onIceCandidate = e => {
  console.log("onIceCandidate 호출됨. candidate:", e.candidate);

  if (e.candidate) {
    socket.emit("candidate", {
      type: "candidate",
      label: e.candidate.sdpMLineIndex,
      id: e.candidate.sdpMid,
      candidate: e.candidate.candidate,
      room: roomUUID,
    });
    console.log("ICE candidate 전송됨:", e.candidate);
  }
}

const onAddStream = e => {
  console.log("onAddStream 호출됨. stream:", e.streams[0]);
  remoteVideo.value.srcObject = e.streams[0];
}

const handleCallOver = () => {
  console.log("handleCallOver 호출됨. 통화 종료.");
  window.location.reload();
}

onMounted(() => {
  startConnection();
});
</script>

<style scoped>
video {
  width: 100%;
  height: auto;
}
</style>
