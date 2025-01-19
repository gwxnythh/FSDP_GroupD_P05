



// Function to fetch account data and populate the dropdown
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

    accountDropdown.addEventListener('change', () => {
        const selectedOption = accountDropdown.options[accountDropdown.selectedIndex];
        balanceDisplay.textContent = selectedOption.dataset.balance ? `SGD ${selectedOption.dataset.balance}` : 'SGD 0.00';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Display total amount from localStorage
    const totalAmount = localStorage.getItem("totalAmount");
    const selectedAccount = localStorage.getItem("selectedAccount");
    const selectedBills = JSON.parse(localStorage.getItem('paymentData'));

    if (totalAmount) {
        document.getElementById('total-amount').textContent = `Total: SGD ${totalAmount}`;
    } else {
        document.getElementById('total-amount').textContent = 'Total: SGD 0.00';
    }

    if (selectedAccount) {
        document.getElementById('fromAccountTextContent').textContent = selectedAccount;
    } else {
        document.getElementById('fromAccountTextContent').textContent = "No account selected";
    }

    const billsContainer = document.getElementById('payBillForContainer');
    if (selectedBills && selectedBills.length > 0) {
        selectedBills.forEach(bill => {
            const billDiv = document.createElement('div');
            billDiv.classList.add('bill-item');
            billDiv.innerHTML = `
                <div class="bill-info">
                <p><strong>${bill.companyName}</strong></p>
                <p>Account Number: ${bill.accountNumber}</p>
            </div>
            <div class="bill-amount"> ${bill.amount}</div>
            `;
            billsContainer.appendChild(billDiv);
        });
    }

    // Add event listener for the Submit button
    
    document.getElementById('submit-button').addEventListener('click', async function() {
        const selectedAccount = localStorage.getItem("selectedAccount");
        const totalAmount = localStorage.getItem("totalAmount");
        
        if (selectedAccount && totalAmount) {
            const accountId = sessionStorage.getItem('AccountID');
            const accessCode = sessionStorage.getItem('accessCode');
            const amount = parseFloat(totalAmount);
    
            // Ensure the payment is processed before redirecting
            await processPayment(accountId, accessCode, amount);
    
            // Redirect to transaction page only after payment is processed
            window.location.href = 'transaction.html';
        } else {
            alert('Please select an account and provide payment details.');
        }
    });
    
});


async function processPayment(FromAccountID,ToAccountID = null,Amount,Description) {
    try {
        // Assuming 'accountId' refers to the account that is making the payment.
        // Also assuming the backend has a route for processing transactions
        const response = await fetch("/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                FromAccountID,    // Account from which payment is made
                ToAccountID,  // Set this to the target account ID
                Amount,  // The amount to deduct
                Description // Payment description
            })
        });
        if (!response.ok) {
            throw new Error('Failed to update account balance');
        }

        // Log the transaction
        const transactionData = {
            accountId: accountId,
            amount: amount,
            description: 'Bill Payment',
            status: 'completed',
            referenceNo: 'BillPayment_' + new Date().toISOString()
        };

        await logTransaction(transactionData);

        // Optionally, you could update the frontend balance immediately after the payment
        // This could involve fetching the new balance and displaying it on the transaction page
        console.log("Payment processed successfully");
    } catch (error) {
        console.error("Error processing payment:", error);
    }
}


