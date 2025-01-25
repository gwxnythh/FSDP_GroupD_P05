let peerConnection = null;
let localStream = null;

// WebSocket for signaling
const signalingServer = new WebSocket("ws://localhost:3000");

signalingServer.onopen = () => {
    console.log("Connected to signaling server as staff.");
    signalingServer.send(JSON.stringify({ role: "staff" }));
};

signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.action === "ringing") {
        console.log("Incoming call. Showing 'Join Call' button.");
        document.getElementById("join-call").style.display = "block";
    } else if (data.offer) {
        console.log("Received WebRTC offer from user.");

        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                signalingServer.send(JSON.stringify({ candidate: event.candidate, target: "user" }));
            }
        };

        peerConnection.ontrack = (event) => {
            document.getElementById("remote-video").srcObject = event.streams[0];
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ answer }));

        console.log("Sent WebRTC answer to user.");
        document.getElementById("join-call").style.display = "none";
        document.getElementById("end-call").style.display = "inline-block";
    } else if (data.candidate) {
        console.log("Received ICE candidate from user.");
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.action === "end-call") {
        console.log("User ended the call.");
        endCall();
    }
};

// Join Call
document.getElementById("join-call").addEventListener("click", () => {
    console.log("Joining the call.");
    document.getElementById("join-call").style.display = "none";
});

// End Call
document.getElementById("end-call").addEventListener("click", () => {
    signalingServer.send(JSON.stringify({ action: "end-call" }));
    endCall();
});

function endCall() {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());

    document.getElementById("remote-video").srcObject = null;
    document.getElementById("join-call").style.display = "none";
    document.getElementById("end-call").style.display = "none";

    console.log("Call ended.");
}
