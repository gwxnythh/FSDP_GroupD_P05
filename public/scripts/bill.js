// Fetch and display accounts
async function fetchAccounts() {
    const accessCode = sessionStorage.getItem('accessCode');
    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`);
        const data = await response.json();
        if (response.ok) {
            displayAccounts(data);
        } else {
            console.error('Error fetching accounts:', data.message);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

// Populate accounts dropdown and update balance display
function displayAccounts(accounts) {
    const accountDropdown = document.getElementById('account-dropdown');
    const balanceDisplay = document.getElementById('selected-account-balance');
    accountDropdown.innerHTML = '<option value="" disabled selected>Select an account</option>';

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.AccountNumber;
        option.textContent = `${account.AccountType} - ${account.AccountNumber}`;
        option.dataset.balance = account.Balance.toFixed(2);
        accountDropdown.appendChild(option);
    });

    // Event listener to update balance display when account is selected
    accountDropdown.addEventListener('change', () => {
        const selectedOption = accountDropdown.options[accountDropdown.selectedIndex];
        balanceDisplay.textContent = `SGD ${selectedOption.dataset.balance || '0.00'}`;
    });
}

// Fetch and display bills
async function fetchAndDisplayBills() {
    try {
        const response = await fetch('/bills');
        if (!response.ok) throw new Error("Failed to fetch bills data");

        const bills = await response.json();
        const container = document.getElementById('payBillForContainer');
        container.innerHTML = ''; // Clear previous content

        bills.forEach(bill => {
            const billDiv = document.createElement('div');
            billDiv.classList.add('bill-item');
            billDiv.innerHTML = `
                <label>
                    <strong>${bill.BillingCompany}</strong><br>
                    Account Number: ${bill.BillingAccNo}<br>
                </label>
                <span class="amount">SGD ${bill.BillAmount.toFixed(2)}</span>
            `;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', updateTotal); // Update total on checkbox change
            billDiv.prepend(checkbox);
            container.appendChild(billDiv);
        });
    } catch (error) {
        console.error("Error displaying bills:", error);
    }
}

// Update total amount based on selected bills
function updateTotal() {
    let total = 0;
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const amountText = checkbox.closest('.bill-item').querySelector('.amount').textContent;
        const amount = parseFloat(amountText.replace('SGD ', ''));
        if (!isNaN(amount)) total += amount;
    });

    // Save the total amount to localStorage
    localStorage.setItem('totalAmount', total.toFixed(2));

    // Update the total on the page
    document.getElementById('total-amount').textContent = `Total: SGD ${total.toFixed(2)}`;
}


// Load and display selected account info from localStorage
function updateAccountDisplay() {
    const savedAccount = localStorage.getItem("selectedAccount");
    document.getElementById("fromAccountTextContent").textContent = savedAccount || "No account selected";
}

// Save payment summary to localStorage
function savePaymentSummary() {
    const selectedAccount = document.getElementById('account-dropdown').value;
    const selectedBills = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => {
        const billItem = checkbox.closest('.bill-item');
        
        // Correctly capture the full billing account number (including the prefix like "HDB")
        const companyName = billItem.querySelector('strong').textContent;
        const accountNumber = billItem.querySelector('label').textContent.match(/Account Number:\s*(\S+)/)[1];  // This captures the full account number with prefix
        
        const amountText = billItem.querySelector('.amount').textContent;
        const amount = `SGD ${parseFloat(amountText.replace('SGD ', '')).toFixed(2)}`;

        return {
            companyName: companyName,
            accountNumber: accountNumber,  // Store the full account number, including the prefix
            amount: amount
        };
    });

    localStorage.setItem("selectedAccount", selectedAccount);
    localStorage.setItem("paymentData", JSON.stringify(selectedBills));
}


// Event listener for saving payment summary and redirecting to next page
document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();  // Fetch accounts data
    fetchAndDisplayBills(); // Fetch bills data
    updateAccountDisplay(); // Display selected account if available
});

// Handle 'Next' button click for payment summary
function handleNextButtonClick() {
    const selectedAccount = document.getElementById("selected-account").value;
    const selectedBills = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => {
        const billDiv = checkbox.closest('.bill-item');
        return {
            BillingCompany: billDiv.querySelector('.billing-company').textContent,
            BillingAccNo: billDiv.querySelector('.billing-account-number').textContent,
            BillAmount: parseFloat(billDiv.querySelector('.amount').textContent.replace('SGD ', ''))
        };
    });

    localStorage.setItem("selectedAccount", selectedAccount);
    localStorage.setItem("selectedBills", JSON.stringify(selectedBills));
    window.location.href = "bill-payment-summary.html";
}
