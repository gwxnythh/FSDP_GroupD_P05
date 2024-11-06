let recognition;
let isProcessingResponse = false; // Flag to track if bot is speaking
let awaitingConfirmation = false; // Flag to track if waiting for user confirmation

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    const chatContent = document.getElementById('chatContent');
    const chatbotToggle = document.getElementById('chatbotToggle');

    if (chatbox.style.display === 'none') {
        chatbox.style.display = 'block';
        chatContent.innerHTML = "<div class='chat-message bot-message'>How may I help you today?</div>";
        speakMessage("How may I help you today?"); // Speak the welcome message
        startVoice(); // Start voice recognition when opening chat
        chatbotToggle.classList.remove('no-pulse');
        chatbotToggle.style.animation = 'pulse 1.5s infinite';
    } else {
        // Stop all microphone input and hide chat
        chatbox.style.display = 'none';
        chatContent.innerHTML = "";
        if (recognition) {
            recognition.stop(); // Stop voice recognition when closing chat
            recognition = null; // Reset recognition to avoid accidental use
        }
        chatbotToggle.classList.add('no-pulse');
        chatbotToggle.style.animation = 'none';
    }
}

function startVoice() {
    if (isProcessingResponse) return; // Only start if not processing
    if (!('webkitSpeechRecognition' in window)) {
        alert("Sorry, your browser does not support speech recognition.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Stop after getting a result
    recognition.interimResults = false; // Do not show interim results
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        console.log("Voice recognition started...");
    };

    recognition.onresult = function (event) {
        if (isProcessingResponse) return; // Ignore results if bot is responding

        const transcript = event.results[0][0].transcript.toLowerCase(); // Get spoken input
        displayUserMessage(transcript);

        // Check if the user said "pay now" in any context
        if (transcript.includes("pay now")) {
            // Prompt for confirmation
            const response = "Do you want to proceed to the pay now page? Please indicate yes or no.";
            displayBotMessage(response);
            speakMessage(response); // Speak the confirmation prompt
            awaitingConfirmation = true; // Set flag to await user confirmation
        } else if (awaitingConfirmation && transcript === "yes") {
            // User confirmed; redirect to paynow.html
            window.location.href = "paynow.html";
            awaitingConfirmation = false; // Reset confirmation flag
        } else {
            const response = "Thank you for your message!";
            displayBotMessage(response);
            speakMessage(response);
        }
    };

    recognition.onend = function () {
        // Only restart recognition if we are not processing a response
        if (!isProcessingResponse && chatbox.style.display === 'block') {
            setTimeout(startVoice, 1000); // Add a slight delay before restarting
        }
    };

    recognition.onerror = function (event) {
        console.error("Error occurred in recognition: " + event.error);
    };

    recognition.start(); // Start the recognition
}

function speakMessage(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';

    utterance.onstart = function () {
        if (recognition) recognition.stop(); // Stop recognition when speaking
        isProcessingResponse = true; // Set processing flag
    };

    utterance.onend = function () {
        isProcessingResponse = false; // Reset processing flag
        // Restart voice recognition after bot finishes speaking if awaiting confirmation
        if (awaitingConfirmation) {
            startVoice();
        } else {
            // If not awaiting confirmation, give a moment before restarting
            setTimeout(startVoice, 1000);
        }
    };

    window.speechSynthesis.speak(utterance); // Speak the message
}

function displayUserMessage(message) {
    const chatContent = document.getElementById('chatContent');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('chat-message', 'user-message');
    userMessageDiv.textContent = message;
    chatContent.appendChild(userMessageDiv);
    chatContent.scrollTop = chatContent.scrollHeight; // Scroll to the bottom
}

function displayBotMessage(message) {
    const chatContent = document.getElementById('chatContent');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('chat-message', 'bot-message');
    botMessageDiv.textContent = message;
    chatContent.appendChild(botMessageDiv);
    chatContent.scrollTop = chatContent.scrollHeight; // Scroll to the bottom
}
