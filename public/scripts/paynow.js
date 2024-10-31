
async function fetchAccounts() {
    const accessCode = sessionStorage.getItem('accessCode'); // Retrieve access code

    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`);
        const data = await response.json();

        if (response.ok) {
            populateAccountDropdown(data);
        } else {
            console.error('Failed to fetch accounts:', data.message);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

async function populateAccountDropdown(accounts) {
    const dropdown = document.getElementById('account-dropdown');
    dropdown.innerHTML = ''; // Clear existing options

    // Add placeholder option
    const placeholder = document.createElement('option');
    placeholder.textContent = 'Select an account';
    placeholder.disabled = true;
    placeholder.selected = true;
    dropdown.appendChild(placeholder);

    // Populate with account options
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.AccountID;
        option.textContent = `${account.AccountType} - ${account.AccountNumber} (${account.Currency} ${account.Balance.toFixed(2)})`;
        dropdown.appendChild(option);
    });
}

// Fetch accounts when the page loads
document.addEventListener('DOMContentLoaded', fetchAccounts);


// Get references to radio buttons and the input fields container
const radioButtons = document.querySelectorAll('input[name="transfer-to"]');
const inputFields = document.getElementById('input-fields');

// Function to update input fields based on the selected transfer type
async function updateInputFields(value) {
    let inputHTML = ''; // Placeholder for dynamic inputs

    switch (value) {
        case 'mobile':
            inputHTML = `
                <input type="text" placeholder="+65" style="width: 20%;" disabled>
                <input type="text" placeholder="12345678" style="width: 35%;">
                <button class="button" type="button">Search</button>`;
            break;

        case 'nric':
            inputHTML = `
                <input type="text" placeholder="S1234567A" style="width: 55%;">
                <button class="button" type="button">Search</button>`;
            break;

        case 'uen':
            inputHTML = `
                <input type="text" placeholder="201912345W" style="width: 55%;">
                <button class="button" type="button">Search</button>`;
            break;
    }

    // Update the input fields container with the new HTML
    inputFields.innerHTML = inputHTML;
}

// Add event listeners to radio buttons
radioButtons.forEach((radio) => {
    radio.addEventListener('change', (event) => {
        updateInputFields(event.target.value);
    });
});

// Set initial state based on the default checked radio button
window.onload = () => {
    const selectedRadio = document.querySelector('input[name="transfer-to"]:checked');
    updateInputFields(selectedRadio.value);
};




