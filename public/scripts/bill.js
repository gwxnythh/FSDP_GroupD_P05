
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
                    <strong>${bill.BillingCompany}</strong>
                    <span class="account-number">&nbsp;Account Number: ${bill.BillingAccNo}<br></span>
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
});

function handleNextButtonClick() {
    // Get the selected account
    const selectedAccount = document.getElementById("account-dropdown").value;
    if (!selectedAccount) {
        alert("Please select an account.");
        return;
    }

    // Get the selected bills
    const selectedBills = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => {
        const billDiv = checkbox.closest('.bill-item');
        const companyName = billDiv.querySelector('strong').textContent;
        const accountNumber = billDiv.querySelector('.account-number').textContent.trim();
        const amountText = billDiv.querySelector('.amount').textContent;
        const amount = parseFloat(amountText.replace('SGD ', '')).toFixed(2);

        return {
            companyName: companyName,
            accountNumber: accountNumber,
            amount: `SGD ${amount}`
        };
    });

    if (selectedBills.length === 0) {
        alert("Please select at least one bill to pay.");
        return;
    }

    // Get the total amount
    const totalAmount = selectedBills.reduce((sum, bill) => {
        return sum + parseFloat(bill.amount.replace('SGD ', ''));
    }, 0);

    // Save data to localStorage
    localStorage.setItem("selectedAccount", selectedAccount);
    localStorage.setItem("paymentData", JSON.stringify(selectedBills));
    localStorage.setItem("totalAmount", totalAmount.toFixed(2));

    // Redirect to the summary page
    window.location.href = "bill-payment-summary.html";
}

// Attach the event listener to the 'Next' button
document.getElementById('next-button').addEventListener('click', handleNextButtonClick);

// Function to select all checkboxes
function selectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('#payBillForContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true; // Select all checkboxes
    });

    // Update the total amount after selecting all
    updateTotal();
}

// Event listener for the "Select All" button
document.getElementById('select-all-btn').addEventListener('click', selectAllCheckboxes);

// Function to deselect all checkboxes
function deselectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('#payBillForContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Deselect all checkboxes
    });

    // Update the total amount after deselecting all
    updateTotal();
}

// Event listener for the "Deselect All" button
document.getElementById('deselect-all-btn').addEventListener('click', deselectAllCheckboxes);


