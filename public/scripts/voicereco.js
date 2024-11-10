let recognition;
let isProcessingResponse = false; // Flag to track if bot is speaking
let awaitingConfirmation = ""; // Track if awaiting specific user confirmation (e.g., "pay now", "home", "transactions")

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    const chatContent = document.getElementById('chatContent');
    const chatbotToggle = document.getElementById('chatbotToggle');

    if (chatbox.style.display === 'none') {
        chatbox.style.display = 'block';
        chatContent.innerHTML = "<div class='chat-message bot-message'>How may I help you today?</div>";
        speakMessage("How may I help you today?");
        startVoice();
        chatbotToggle.classList.remove('no-pulse');
        chatbotToggle.style.animation = 'pulse 1.5s infinite';
    } else {
        chatbox.style.display = 'none';
        chatContent.innerHTML = "";
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        chatbotToggle.classList.add('no-pulse');
        chatbotToggle.style.animation = 'none';
    }
}

function startVoice() {
    if (isProcessingResponse) return;
    if (!('webkitSpeechRecognition' in window)) {
        alert("Sorry, your browser does not support speech recognition.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        console.log("Voice recognition started...");
    };

    recognition.onresult = function (event) {
        if (isProcessingResponse) return;

        const transcript = event.results[0][0].transcript.toLowerCase();
        displayUserMessage(transcript);

        // Check for "pay now", "home", or "transaction(s)" in any sentence and prompt for confirmation
        if (transcript.includes("pay now")) {
            const response = "Do you want to proceed to the pay now page? Please indicate yes or no.";
            displayBotMessage(response);
            speakMessage(response);
            awaitingConfirmation = "paynow"; // Set flag to await "pay now" confirmation
        } else if (transcript.includes("home")) {
            const response = "Do you want to go back to the home page? Please indicate yes or no.";
            displayBotMessage(response);
            speakMessage(response);
            awaitingConfirmation = "home"; // Set flag to await "home" confirmation
        } else if (transcript.includes("transaction") || transcript.includes("transactions")) {
            const response = "Do you want to see your transactions? Please indicate yes or no.";
            displayBotMessage(response);
            speakMessage(response);
            awaitingConfirmation = "transactions"; // Set flag to await "transactions" confirmation
        } else if (awaitingConfirmation === "paynow" && transcript === "yes") {
            window.location.href = "paynow.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else if (awaitingConfirmation === "home" && transcript === "yes") {
            window.location.href = "index.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else if (awaitingConfirmation === "transactions" && transcript === "yes") {
            window.location.href = "transaction.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else {
            const response = "Sorry I didn't quite catch that.";
            displayBotMessage(response);
            speakMessage(response);
        }
    };

    recognition.onend = function () {
        if (!isProcessingResponse && chatbox.style.display === 'block') {
            setTimeout(startVoice, 1000);
        }
    };

    recognition.onerror = function (event) {
        console.error("Error occurred in recognition: " + event.error);
    };

    recognition.start();
}

function speakMessage(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';

    utterance.onstart = function () {
        if (recognition) recognition.stop();
        isProcessingResponse = true;
    };

    utterance.onend = function () {
        isProcessingResponse = false;
        if (awaitingConfirmation) {
            startVoice();
        } else {
            setTimeout(startVoice, 1000);
        }
    };

    window.speechSynthesis.speak(utterance);
}

function displayUserMessage(message) {
    const chatContent = document.getElementById('chatContent');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('chat-message', 'user-message');
    userMessageDiv.textContent = message;
    chatContent.appendChild(userMessageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function displayBotMessage(message) {
    const chatContent = document.getElementById('chatContent');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('chat-message', 'bot-message');
    botMessageDiv.textContent = message;
    chatContent.appendChild(botMessageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}
