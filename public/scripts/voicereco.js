let recognition;
let isProcessingResponse = false; // Flag to track if bot is speaking
let awaitingConfirmation = ""; // Track if awaiting specific user confirmation (e.g., "pay now", "home", "transactions")

document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById('chatbotToggle');
    if (chatbotToggle && !isVoiceRecognitionEnabled()) {
        chatbotToggle.style.display = "none";
    } else if (chatbotToggle) {
        chatbotToggle.style.display = "block";
    }
});

// check if user enable voice over
function isVoiceRecognitionEnabled() {
    let voiceRecognition = localStorage.getItem("voiceRecognition");
    console.log('voiceRecognition: ' + voiceRecognition)
    if (voiceRecognition) {
        return voiceRecognition === 'true';
    }
    return false;
}

function toggleChat() {
    if (isVoiceRecognitionEnabled() === false) {
        return;
    }
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

async function fetchUserByMobile(mobileNumber) {
    const fullNameDisplay = document.getElementById('full-name-display');
    try {
        const response = await fetch(`/users/mobile?mobile=${mobileNumber}`);
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            console.error('Failed to fetch user:', data.message);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}
async function summarizePayment(TransferType, TransferTo, FromAccountID, FromAccountTextContent, Amount, Purpose, Description) {
    try {
        const payload = JSON.stringify({
            TransferType,
            TransferTo,
            FromAccountID,
            FromAccountTextContent,
            Amount,
            Purpose,
            Description
        })
        const response = await fetch("/transactions/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        });
        if (response.ok) {

            window.location = "/paynow-summary.html?payload=" + payload;

        } else {
            // Handle errors from the server
            const errorData = await response.json();
            console.error("Error creating transaction:", errorData.message);
            alert(`Error: ${errorData.message}`);
        }      
    }catch (error) {
        console.log('error: ', error);
    }
}
async function fetchCurrentAccountByAccessCode() {
    const accessCode = sessionStorage.getItem('accessCode'); // Fetch logged-in user's access code
    if (!accessCode) {
        console.error("Access code not found in session storage.");
        return null;
    }

    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`); // Fetch accounts for logged-in user
        const data = await response.json();

        if (response.ok) {
            // Find the "Current" account
            const currentAccount = data.find(account => account.AccountType === 'Current');
            if (!currentAccount) {
                console.error("No 'Current' account found for logged-in user.");
                return null;
            }
            return currentAccount; // Return the "Current" account object
        } else {
            console.error('Failed to fetch user accounts:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user accounts:', error);
        return null;
    }
}

async function processVoicePaymentCommand(amount, mobileNumber) {
    try {
        console.log(`Processing payment: Amount = ${amount}, Mobile = ${mobileNumber}`);

        // Retrieve the current account linked to the mobile number
        const account = await fetchUserByMobile(mobileNumber);
        const currentacc = await fetchCurrentAccountByAccessCode()
        console.log("Account fetched:", account); // Log the retrieved account

        if (!account) {
            console.error("No account found for mobile number:", mobileNumber);
            alert("No current account found for this mobile number.");
            return;
        }

        // Define payment details
        const transferType = "mobile";
        const transferTo = mobileNumber;
        const fromAccountID = currentacc.AccountID;
        const fromAccountTextContent = `${currentacc.AccountType} - ${currentacc.AccountNumber} (SGD ${currentacc.Balance.toFixed(2)})`;;
        const purpose = "PayNow Transfer"; // Default or extracted from voice input
        const description = `Payment of ${amount} dollars to ${mobileNumber}`;

        console.log("Payment details:", {
            transferType,
            transferTo,
            fromAccountID,
            fromAccountTextContent,
            amount,
            purpose,
            description,
        });

        // Summarize the payment and redirect
        await summarizePayment(transferType, transferTo, fromAccountID, fromAccountTextContent, amount, purpose, description);
        console.log("Payment summarized successfully.");
    } catch (error) {
        console.error("Error processing voice command:", error); // Log the error object
        alert("There was an issue processing your request.");
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
    
        // Regex to extract "$500", "500 dollars", and mobile numbers with spaces
        const paymentRegex = /i want to pay\s*(?:\$)?(\d+)(?:\s*dollars?)?\s*to\s*(?:mobile number|phone)\s*([\d\s]{8,})/;
        const match = transcript.match(paymentRegex);
    
        if (match) {
            const amount = match[1];  // Extract amount (e.g., "500")
            const mobileNumber = match[2].replace(/\s+/g, ''); // Remove spaces from mobile number
    
            const response = "Redirecting to the payment summary.";
            displayBotMessage(response);
            speakMessage(response);
    
            // Call processVoicePaymentCommand with extracted values
            processVoicePaymentCommand(amount, mobileNumber);
        } else if (transcript.includes("dark mode on")) {
            // Enable dark mode if not already enabled
            if (!document.body.classList.contains('dark-mode')) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                const response = "Dark mode enabled.";
                displayBotMessage(response);
                speakMessage(response);
            } else {
                const response = "Dark mode is already enabled.";
                displayBotMessage(response);
                speakMessage(response);
            }
        } else if (transcript.includes("dark mode off")) {
            // Disable dark mode if currently enabled
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
                const response = "Dark mode disabled.";
                displayBotMessage(response);
                speakMessage(response);
            } else {
                const response = "Dark mode is already disabled.";
                displayBotMessage(response);
                speakMessage(response);
            }
        } else if (transcript.includes("pay now")) {
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
        } else if (transcript.includes("latest payment")) {
            const response = "Do you want to proceed to your latest payment? Please indicate yes or no.";
            displayBotMessage(response);
            speakMessage(response);
            awaitingConfirmation = "latestpayment";
        } else if (awaitingConfirmation === "paynow" && transcript === "yes") {
            window.location.href = "paynow.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else if (awaitingConfirmation === "home" && transcript === "yes") {
            window.location.href = "index.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else if (awaitingConfirmation === "transactions" && transcript === "yes") {
            window.location.href = "transaction.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else if (awaitingConfirmation === "latestpayment" && transcript === "yes") {
            window.location.href = "latest-payment.html";
            awaitingConfirmation = ""; // Reset confirmation flag
        } else {
            const response = "Sorry, I didn't quite catch that.";
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
