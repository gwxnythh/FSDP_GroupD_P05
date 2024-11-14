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
    const billingCompanies = ['pub', 'lta', 'hdb', 'ntuc', 'singtel']; // List of simplified company names

    for (const company of billingCompanies) {
        try {
            // Fetch bill amount for the simplified company name
            const response = await fetch(`/bills/amount/${company}`);
            const data = await response.json();

            console.log(`Received billing company: ${company}`);
            console.log(`Fetched data: `, data);

            // Check if the response is valid and contains a BillAmount
            if (response.ok && data && data.BillAmount !== null) {
                let amount = `SGD ${data.BillAmount.toFixed(2)}`;

                // Special handling for LTA and NTUC
                if ((company === 'lta' && data.BillingCompany && data.BillingCompany.includes('Road Tax')) ||
                    (company === 'ntuc' && data.BillingCompany && data.BillingCompany.includes('Income'))) {
                    // For 'LTA Road Tax' or 'NTUC Income', don't show the amount
                    amount = 'SGD 0.00';
                }

                // Update the amount in the DOM
                updateAmount(company, amount);
            } else {
                updateAmount(company, 'SGD 0.00'); // Default to 0.00 if no amount is found
            }
        } catch (error) {
            console.error('Error fetching billing amount:', error);
            updateAmount(company, 'SGD 0.00'); // Default in case of error
        }
    }
}

// Function to update the bill summary in the HTML
function updateBillSummary(billData) {
    const container = document.getElementById('payBillForContainer');
    container.innerHTML = ''; // Clear previous content

    billData.forEach(bill => {
        const billDiv = document.createElement('div');
        billDiv.classList.add('bill-detail');

        const billName = document.createElement('div');
        billName.classList.add('bill-name');
        billName.textContent = bill.BillingCompany;

        const billReference = document.createElement('div');
        billReference.classList.add('reference-number');
        billReference.textContent = `Reference: ${bill.BillingAccNo}`;

        const billAmount = document.createElement('div');
        billAmount.classList.add('amount');
        billAmount.textContent = `Amount: SGD ${parseFloat(bill.BillAmount).toFixed(2)}`;

        const billContentDiv = document.createElement('div');
        billContentDiv.classList.add('bill-content');

        billContentDiv.appendChild(billName);
        billContentDiv.appendChild(billReference);
        billContentDiv.appendChild(billAmount);

        billDiv.appendChild(billContentDiv);
        container.appendChild(billDiv);
    });
}

// Fetch and update bill data when the page loads
async function fetchBillData() {
    try {
        const response = await fetch('/api/bills'); // API endpoint to get bill data
        if (!response.ok) {
            throw new Error('Failed to fetch bill data');
        }
        const billData = await response.json();
        updateBillSummary(billData); // Update the bill summary with the fetched data
    } catch (error) {
        console.error(error.message);
    }
}

document.addEventListener('DOMContentLoaded', fetchBillData);

// Call fetchBillAmounts when the page content is fully loaded
document.addEventListener('DOMContentLoaded', fetchBillAmounts);

// Function to update the amount in the HTML
function updateAmount(company, amount) {
    // Find the element based on the data-company attribute
    const amountSpan = document.querySelector(`.amount[data-company="${company}"]`);
    if (amountSpan) {
        amountSpan.textContent = amount; // Update the amount in the span
    } else {
        console.error(`No .amount element found for ${company}`);
    }
}

// Call fetchBillAmounts when the page content is fully loaded
document.addEventListener('DOMContentLoaded', fetchBillAmounts);


// Function to save the selected account to localStorage
function saveAccount() {
    const selectedAccount = document.getElementById("account-dropdown").value;
    
    // Assuming that the value of selected account will also include the number (e.g., 'Saving Account - 12345678')
    localStorage.setItem("selectedAccount", selectedAccount);
}

// Function to store selected companies and their data when 'Next' is clicked
function savePaymentSummary() {
    const selectedCompanies = document.querySelectorAll('input[name="transfer-to"]:checked');
    const paymentData = [];

    selectedCompanies.forEach(company => {
        const companyName = company.parentElement.querySelector('.left-checkbox').textContent;
        const accountNumber = company.value; // Or use a different way to get account number
        const amount = company.parentElement.querySelector('.amount').textContent;

        // Store the selected data
        paymentData.push({ companyName, accountNumber, amount });
    });

    // Store in localStorage to access on the summary page
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
}

