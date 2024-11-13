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
    const accountDropdown = document.getElementById('account-dropdown');
    const balanceDisplay = document.getElementById('selected-account-balance');

    // Clear any existing options in the dropdown
    accountDropdown.innerHTML = '<option value="" disabled selected>Select an account</option>';

    // Populate the dropdown with account options
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.AccountNumber; // Use AccountNumber or any unique ID
        option.textContent = `${account.AccountType} - ${account.AccountNumber}`;
        option.dataset.balance = account.Balance.toFixed(2); // Store the balance in a data attribute
        accountDropdown.appendChild(option);
    });

    // Event listener to update balance display when an account is selected
    accountDropdown.addEventListener('change', () => {
        const selectedOption = accountDropdown.options[accountDropdown.selectedIndex];
        const balance = selectedOption.dataset.balance;
        balanceDisplay.textContent = balance ? `SGD ${balance}` : 'SGD 0.00';
    });
}

// Fetch and display accounts when the page loads
document.addEventListener('DOMContentLoaded', fetchAccounts);


async function fetchBillAmounts() {
    try {
        const amount = await fetch(`/bills/amount/${billingCompany}`); 
        const data = await response.json();

        if (response.ok) {
            amount(data); // Call the function to display accounts
        } else {
            console.error('Error fetching billing amount:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayBillAmounts(bills) {
}



    


