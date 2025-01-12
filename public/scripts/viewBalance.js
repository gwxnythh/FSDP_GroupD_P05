async function fetchAccounts() {
    const accessCode = sessionStorage.getItem('accessCode'); // Adjust according to your implementation

    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`); // Fetch accounts based on access code
        const data = await response.json();

        if (response.ok) {
            displayAccounts(data); // Call the function to display accounts
        } else {
            console.error('Error fetching accounts:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayAccounts(accounts) {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = ''; // Clear existing accounts

    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        accountItem.innerHTML = `
            <div class="account-details">
                <h4>${account.AccountType}</h4>
                <p class="account-number">${account.AccountNumber}</p>
            </div>
            <div class="account-balance">
                <p>${account.Currency}</p>
                <h4>${account.Balance.toFixed(2)}</h4>
            </div>
        `;

        // Add event listener for voice output on click
        accountItem.addEventListener('click', () => {
            const message = `Your ${account.AccountType} account has a balance of ${account.Balance.toFixed(2)} dollars`;
            speak(message);  // Call the speak function for voice output
        });

        accountsList.appendChild(accountItem);
    });
}

// Call fetchAccounts when the page loads
document.addEventListener('DOMContentLoaded', fetchAccounts);

// Function to handle voice output
function speak(text) {
    // if voice over is disabled, don't process
    if (!isVoiceOverEnabled()) {
        return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel(); // Cancel any ongoing speech to avoid overlapping
    }
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
    console.log("Speaking:", text);  // Log the spoken text for debugging
}

// check if user enable voice over
function isVoiceOverEnabled() {
    let voiceOver = localStorage.getItem("voiceOver");
    if (voiceOver) {
        return voiceOver === 'true';
    }
    return false;
}
