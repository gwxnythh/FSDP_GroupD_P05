
// //bill-summary.js
// // Function to fetch account data and populate the dropdown
// async function fetchAccounts() {
//     const accessCode = sessionStorage.getItem('accessCode');
//     try {
//         const response = await fetch(`/accounts?accessCode=${accessCode}`);
//         const data = await response.json();
//         if (response.ok) {
//             displayAccounts(data);
//         } else {
//             console.error('Error fetching accounts:', data.message);
//         }
//     } catch (error) {
//         console.error('Error fetching accounts:', error);
//     }
// }

// // Populate accounts dropdown and update balance display
// function displayAccounts(accounts) {
//     const accountDropdown = document.getElementById('account-dropdown');
//     const balanceDisplay = document.getElementById('selected-account-balance');
//     accountDropdown.innerHTML = '<option value="" disabled selected>Select an account</option>';

//     accounts.forEach(account => {
//         const option = document.createElement('option');
//         option.value = account.AccountNumber;
//         option.textContent = `${account.AccountType} - ${account.AccountNumber}`;
//         option.dataset.balance = account.Balance.toFixed(2);
//         accountDropdown.appendChild(option);
//     });

//     accountDropdown.addEventListener('change', () => {
//         const selectedOption = accountDropdown.options[accountDropdown.selectedIndex];
//         balanceDisplay.textContent = selectedOption.dataset.balance ? `SGD ${selectedOption.dataset.balance}` : 'SGD 0.00';
//     });
// }

// document.addEventListener('DOMContentLoaded', function() {
//     // Display total amount from localStorage
//     const totalAmount = localStorage.getItem("totalAmount");
//     const selectedAccount = localStorage.getItem("selectedAccount");
//     const selectedBills = JSON.parse(localStorage.getItem('paymentData'));

//     if (totalAmount) {
//         document.getElementById('total-amount').textContent = `Total: SGD ${totalAmount}`;
//     } else {
//         document.getElementById('total-amount').textContent = 'Total: SGD 0.00';
//     }

//     if (selectedAccount) {
//         document.getElementById('fromAccountTextContent').textContent = selectedAccount;
//     } else {
//         document.getElementById('fromAccountTextContent').textContent = "No account selected";
//     }

//     const billsContainer = document.getElementById('payBillForContainer');
//     if (selectedBills && selectedBills.length > 0) {
//         selectedBills.forEach(bill => {
//             const billDiv = document.createElement('div');
//             billDiv.classList.add('bill-item');
//             billDiv.innerHTML = `
//                 <div class="bill-info">
//                 <p><strong>${bill.companyName}</strong></p>
//                 <p>Account Number: ${bill.accountNumber}</p>
//             </div>
//             <div class="bill-amount"> ${bill.amount}</div>
//             `;
//             billsContainer.appendChild(billDiv);
//         });
//     }

//     // Add event listener for the Submit button
    
//     document.getElementById('submit-button').addEventListener('click', async function() {
//         const selectedAccount = localStorage.getItem("selectedAccount");
//         const totalAmount = localStorage.getItem("totalAmount");
        
//         if (selectedAccount && totalAmount) {
//             const accountId = sessionStorage.getItem('AccountID');
//             const accessCode = sessionStorage.getItem('accessCode');
//             const amount = parseFloat(totalAmount);
    
//             // Ensure the payment is processed before redirecting
//             await processPayment(accountId, accessCode, amount);
    
//             // Redirect to transaction page only after payment is processed
//             window.location.href = 'transaction.html';
//         } else {
//             alert('Please select an account and provide payment details.');
//         }
//     });
    
// });


// async function processPayment(FromAccountID,ToAccountID = null,Amount,Description) {
//     try {
//         // Assuming 'accountId' refers to the account that is making the payment.
//         // Also assuming the backend has a route for processing transactions
//         const response = await fetch("/transactions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 FromAccountID,    // Account from which payment is made
//                 ToAccountID,  // Set this to the target account ID
//                 Amount,  // The amount to deduct
//                 Description // Payment description
//             })
//         });
//         if (!response.ok) {
//             throw new Error('Failed to update account balance');
//         }

//         // Log the transaction
//         const transactionData = {
//             accountId: accountId,
//             amount: amount,
//             description: 'Bill Payment',
//             status: 'completed',
//             referenceNo: 'BillPayment_' + new Date().toISOString()
//         };

//         await logTransaction(transactionData);

//         // Optionally, you could update the frontend balance immediately after the payment
//         // This could involve fetching the new balance and displaying it on the transaction page
//         console.log("Payment processed successfully");
//     } catch (error) {
//         console.error("Error processing payment:", error);
//     }
// }



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

document.addEventListener('DOMContentLoaded', function () {
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
                <div class="bill-amount">${bill.amount}</div>
            `;
            billsContainer.appendChild(billDiv);
        });
    }

    document.getElementById('submit-button').addEventListener('click', async function () {
        const selectedAccount = localStorage.getItem("selectedAccount");
        const totalAmount = localStorage.getItem("totalAmount");

        if (selectedAccount && totalAmount) {
            const accountId = sessionStorage.getItem('AccountID');
            const amount = parseFloat(totalAmount);

            console.log('Payment Request Payload:', {
                FromAccountID: accountId,
                ToAccountID: 'BILL_PAYMENT',
                Amount: amount,
                Description: 'Bill Payment'
            });

            const paymentSuccess = await processPayment(accountId, 'BILL_PAYMENT', amount, 'Bill Payment');

            if (paymentSuccess) {
                await fetchUpdatedTransactions(); // Fetch and update transactions
                alert('Payment successful!');
                window.location.href = 'transaction.html';
            } else {
                alert('Payment failed. Please try again.');
            }
        } else {
            alert('Please select an account and provide payment details.');
        }
    });
});

// Function to add a row to the transaction table
function updateTransactionTable(description, status, referenceNo, amount) {
    const transactionTable = document.getElementById('transaction-table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td>${description}</td>
        <td>${referenceNo}</td>
        <td><span class="transaction-status">${status}</span></td>
        <td class="transaction-amount ${status === 'completed' ? 'amount-positive' : 'amount-negative'}">
            SGD ${amount.toFixed(2)}
        </td>
    `;

    transactionTable.appendChild(newRow);
}

// Function to process the payment
async function processPayment(FromAccountID, ToAccountID = 'BILL_PAYMENT', Amount, Description) {
    try {
        const response = await fetch("/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                FromAccountID,
                ToAccountID,
                Amount,
                Description,
            }),
        });

        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('Server Error Response:', errorResponse);
            throw new Error(errorResponse || 'Payment processing failed');
        }

        const result = await response.json();
        if (result.transactionStatus === 'Completed') {
            console.log('Payment successful:', result);
            return true;
        } else {
            console.error('Payment failed:', result);
            return false;
        }
    } catch (error) {
        console.error('Error processing payment:', error.message || error);
        return false;
    }
}

// Function to fetch updated transactions after payment
async function fetchUpdatedTransactions() {
    const accountId = sessionStorage.getItem('AccountID');
    try {
        const response = await fetch(`/transactions/account/${accountId}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessCode')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');
        const transactions = await response.json();

        populateTransactionTable(transactions);
    } catch (error) {
        console.error('Error fetching updated transactions:', error);
    }
}

// Populate the transaction table
function populateTransactionTable(transactions) {
    const tableBody = document.getElementById('transaction-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.TransactionDate).toLocaleDateString()}</td>
            <td>${transaction.Description}</td>
            <td>${transaction.ReferenceNo}</td>
            <td><span class="transaction-status">${transaction.Status}</span></td>
            <td class="transaction-amount ${transaction.Status === 'Completed' ? 'amount-positive' : 'amount-negative'}">
                SGD ${transaction.Amount.toFixed(2)}
            </td>
        `;
        tableBody.appendChild(row);
    });
}