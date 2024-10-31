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
            // Redirect to index.html on successful login
            window.location.href = 'index.html';
        } else {
            alert(data.message); // Display error message if login fails
        }
    } catch (error) {
        console.error('Error:', error);
    }
}