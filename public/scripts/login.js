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

// Function to trigger voice output
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Check if the user is logged in and display their name
document.addEventListener('DOMContentLoaded', () => {
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('user-name').textContent = userName;
    }
});
