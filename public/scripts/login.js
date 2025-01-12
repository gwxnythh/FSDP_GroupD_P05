async function login() {
    const accessCode = document.getElementById('accessCode').value;
    const pin = document.getElementById('pin').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessCode, pin })
        });

        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem('accessCode', accessCode); // Store access code in sessionStorage
            sessionStorage.setItem('userName', data.user); // Store the user's full name in sessionStorage
            saveAccessibilityMode(data.accounts[0].isHapticTouch, data.accounts[0].isVoiceOver, data.accounts[0].isVoiceRecognition)
            // Trigger voice output with user's full name
            speak(`Welcome ${data.user}`);

            // Redirect to index.html on successful login
            window.location.href = 'index.html';
        } else {
            alert(data.message); // Display error message if login fails
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function saveAccessibilityMode(hapticTouch, voiceOver, voiceRecognition) {
    if (hapticTouch) {
        localStorage.setItem("hapticTouch", true);
    } else {
        localStorage.setItem("hapticTouch", false);
    }

    if (voiceOver) {
        localStorage.setItem("voiceOver", true);
    } else {
        localStorage.setItem("voiceOver", false);
    }

    if (voiceRecognition) {
        localStorage.setItem("voiceRecognition", true);
    } else {
        localStorage.setItem("voiceRecognition", false);
    }
}


// Function to trigger voice output
function speak(text) {
    // if voice over is disabled, don't process
    if (!isVoiceOverEnabled()) {
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// check if user enable voice over
function isVoiceOverEnabled() {
    let voiceOver = localStorage.getItem("voiceOver");
    if (voiceOver) {
        return voiceOver === 'true';
    }
    return false;
}

// Check if the user is logged in and display their name
document.addEventListener('DOMContentLoaded', () => {
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('user-name').textContent = userName;
    }
});
