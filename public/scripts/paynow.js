
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

function populateAccountDropdown(accounts) {
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




