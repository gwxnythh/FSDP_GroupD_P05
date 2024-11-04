let recognition;

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    const chatContent = document.getElementById('chatContent');
    const chatbotToggle = document.getElementById('chatbotToggle');

    if (chatbox.style.display === 'none') {
        chatbox.style.display = 'block';
        chatContent.innerHTML = "<div class='chat-message bot-message'>How may I help you today?</div>";
        startVoice(); // Start voice recognition when opening chat
        chatbotToggle.classList.remove('no-pulse'); // Enable pulsing effect
        chatbotToggle.style.animation = 'pulse 1.5s infinite'; // Start pulsing animation
    } else {
        chatbox.style.display = 'none';
        chatContent.innerHTML = "";
        if (recognition) {
            recognition.stop(); // Stop voice recognition when closing chat
        }
        chatbotToggle.classList.add('no-pulse'); // Disable pulsing effect
        chatbotToggle.style.animation = 'none'; // Stop pulsing animation
    }
}

function startVoice() {
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
        const transcript = event.results[0][0].transcript.toLowerCase(); // Convert to lowercase for easier comparison
        displayUserMessage(transcript);

        // Check for specific commands
        if (transcript === "close voice over") {
            toggleChat(); // Close the chat if the command is given
        } else {
            // Simulate bot response (customize this)
            displayBotMessage("Thank you for your message!");
        }
    };

    recognition.onend = function () {
        console.log("Voice recognition ended.");
        if (chatbox.style.display === 'block') {
            startVoice(); // Restart voice recognition when chat is open
        }
    };

    recognition.onerror = function (event) {
        console.error("Error occurred in recognition: " + event.error);
    };

    recognition.start();
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