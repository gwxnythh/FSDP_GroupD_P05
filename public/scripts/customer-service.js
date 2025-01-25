let localStream = null;
let screenStream = null;
let peerConnection = null;
let isScreenSharing = false;
let signalingServer = null;

// WebSocket for signaling
signalingServer = new WebSocket("ws://localhost:3000");

signalingServer.onopen = () => {
    console.log("Connected to signaling server as a user.");
    signalingServer.send(JSON.stringify({ role: "user" })); // Identify as user
};

signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.answer) {
        console.log("Received answer from staff.");
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        console.log("Received ICE candidate from staff.");
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// Start Call
document.getElementById("start-call").addEventListener("click", async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("local-video").srcObject = localStream;
        const currentURL = window.location.href; 
        window.open(currentURL, "_blank"); 
        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // Add local tracks to the connection
        localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

        // Handle remote tracks
        peerConnection.ontrack = (event) => {
            document.getElementById("remote-video").srcObject = event.streams[0];
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                signalingServer.send(JSON.stringify({ candidate: event.candidate, target: "staff" }));
            }
        };

        // Create and send the WebRTC offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingServer.send(JSON.stringify({ offer }));

        console.log("Call started. Waiting for staff to join...");

        // Update UI
        document.getElementById("start-call").style.display = "none";
        document.getElementById("share-screen").style.display = "inline-block";
        document.getElementById("toggle-camera").style.display = "inline-block";
        document.getElementById("end-call").style.display = "inline-block";
    } catch (error) {
        console.error("Error starting call:", error);
    }
});

// Share Screen
document.getElementById("share-screen").addEventListener("click", async () => {
    const shareButton = document.getElementById("share-screen");

    if (!isScreenSharing) {
        try {
            // Request the user to share their screen
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });

            const screenTrack = screenStream.getTracks()[0];
            const sender = peerConnection.getSenders().find((s) => s.track && s.track.kind === "video");

            if (sender) {
                sender.replaceTrack(screenTrack); // Replace camera track with screen track
                isScreenSharing = true;
                shareButton.textContent = "Stop Sharing";

                console.log("Screen sharing started: ", screenTrack.label);

                // Listen for when the user stops sharing
                screenTrack.onended = () => {
                    console.log("User manually stopped screen sharing.");
                    stopScreenSharing(sender);
                };
            } else {
                console.error("No video sender found.");
            }
        } catch (error) {
            console.error("Error starting screen sharing:", error);
            if (error.name === "AbortError") {
                console.log("Screen sharing was aborted by the user.");
            } else if (error.name === "NotAllowedError") {
                console.log("Permission denied for screen sharing.");
            }
        }
    } else {
        const sender = peerConnection.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) stopScreenSharing(sender);
    }
});

// Stop Screen Sharing
function stopScreenSharing(sender) {
    // Revert to camera video track
    const cameraTrack = localStream.getTracks().find((t) => t.kind === "video");

    if (cameraTrack && sender) {
        sender.replaceTrack(cameraTrack);
    }

    // Stop screen sharing tracks
    if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        screenStream = null;
    }

    isScreenSharing = false;
    document.getElementById("share-screen").textContent = "Share Screen";
    console.log("Screen sharing stopped and reverted to camera.");
}


// Toggle Camera
document.getElementById("toggle-camera").addEventListener("click", () => {
    const videoTrack = localStream.getTracks().find((track) => track.kind === "video");

    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById("toggle-camera").textContent = videoTrack.enabled
            ? "Turn Off Camera"
            : "Turn On Camera";
    }
});

// End Call
document.getElementById("end-call").addEventListener("click", () => {
    signalingServer.send(JSON.stringify({ action: "end-call" }));

    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    if (screenStream) screenStream.getTracks().forEach((track) => track.stop());

    document.getElementById("local-video").srcObject = null;
    document.getElementById("remote-video").srcObject = null;

    document.getElementById("start-call").style.display = "inline-block";
    document.getElementById("share-screen").style.display = "none";
    document.getElementById("toggle-camera").style.display = "none";
    document.getElementById("end-call").style.display = "none";

    console.log("Call ended.");
});
