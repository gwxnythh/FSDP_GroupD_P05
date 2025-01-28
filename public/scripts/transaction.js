//transaction.js
document.addEventListener('DOMContentLoaded', async () => {
    const accessCode = sessionStorage.getItem('accessCode');
    
    // Clear AccountID for a fresh fetch each time the user logs in
    sessionStorage.removeItem('AccountID');
    
    let accountId = await getAccountIDIfNeeded();
    if (accessCode && accountId) {
        await getCurrentAccountBalance(accountId, accessCode);
        await fetchTransactionHistory(accountId, accessCode);
    } else {
        console.error("Unable to retrieve account data. Please try logging in again.");
    }
});

async function getAccountIDIfNeeded() {
    let accountId = sessionStorage.getItem('AccountID');
    if (!accountId) {
        const accessCode = sessionStorage.getItem('accessCode');
        const response = await fetch(`/accounts?accessCode=${accessCode}`);
        const data = await response.json();
        
        if (data && data[0]) {
            accountId = data[0].AccountID;
            sessionStorage.setItem('AccountID', accountId);
        } else {
            console.error("Failed to retrieve AccountID.");
        }
    }
    return accountId;
}

/*
// Clear session data on logout
document.getElementById('header-logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html'; // Redirect to login page
});
*/

// Fetch current account balance
async function getCurrentAccountBalance(accountId, accessCode) {
    try {
        const response = await fetch(`/accounts/balance/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${accessCode}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch current account balance`);

        const data = await response.json();
        document.getElementById('balanceAmount').textContent = `$${parseFloat(data.balance).toFixed(2)}`;
    } catch (error) {
        console.error('Error fetching balance:', error);
        document.getElementById('balanceAmount').textContent = "Balance unavailable";
    }
}

// Fetch transaction history
async function fetchTransactionHistory(accountId, accessCode) {
    try {
        const response = await fetch(`/transactions/account/${accountId}`, {
            headers: { 'Authorization': `Bearer ${accessCode}` }
        });

        if (!response.ok) throw new Error('Failed to fetch transaction history');
        
        const transactions = await response.json();
        populateTransactionTable(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Convert the date to UTC and then format it
    const day = String(date.getUTCDate()).padStart(2, '0'); // Day in UTC
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month in UTC (0-indexed)
    const year = date.getUTCFullYear(); // Year in UTC

    return `${day}/${month}/${year}`;
}


function populateTransactionTable(transactions) {
    const tableBody = document.getElementById('transaction-table-body');
    tableBody.innerHTML = ''; // Clear previous rows

    const accountId = sessionStorage.getItem('AccountID');

    // Sort transactions by date, from most recent to least recent
    transactions.sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate));

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        let amountText = '';
        let amountClass = '';

        if (transaction.FromAccountID === accountId) {
            amountText = `-$${transaction.Amount.toFixed(2)}`;
            amountClass = 'amount-negative';
        } else if (transaction.ToAccountID === accountId) {
            amountText = `+$${transaction.Amount.toFixed(2)}`;
            amountClass = 'amount-positive';
        }

        row.innerHTML = `
            <td>${formatDate(transaction.TransactionDate)}</td> <!-- Formatted Date -->
            <td>${transaction.Description}</td>
            <td>${transaction.ReferenceNo}</td>
            <td><span class="transaction-status">${transaction.Status}</span></td>
            <td class="transaction-amount ${amountClass}">
                ${amountText}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addNewTransactionRow(transaction) {
    const tableBody = document.getElementById('transaction-table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${formatDate(transaction.TransactionDate)}</td>
        <td>${transaction.Description}</td>
        <td>${transaction.ReferenceNo}</td>
        <td><span class="transaction-status">${transaction.Status}</span></td>
        <td class="transaction-amount ${transaction.Status === 'Completed' ? 'amount-positive' : 'amount-negative'}">
            ${transaction.Amount > 0 ? `+SGD ${transaction.Amount.toFixed(2)}` : `-SGD ${Math.abs(transaction.Amount).toFixed(2)}`}
        </td>
    `;

    tableBody.appendChild(newRow);
}
