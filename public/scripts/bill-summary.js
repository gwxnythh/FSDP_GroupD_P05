// Function to update the total amount based on selected checkboxes
function updateTotal() {
    let total = 0;

    // Loop through each checkbox and check if it's checked
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const amountText = checkbox.closest('.bill-item').querySelector('.amount').textContent;
        const amount = parseFloat(amountText.replace('SGD ', '').trim());

        if (!isNaN(amount)) {
            total += amount; // Add the amount to the total
        }
    });

    // Update the total in the DOM
    document.getElementById('total-amount').textContent = `Total: SGD ${total.toFixed(2)}`;
}

// Add event listeners to checkboxes to update the total when they are checked or unchecked
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateTotal);
});

// Call updateTotal on page load to ensure the initial total is correct
document.addEventListener('DOMContentLoaded', updateTotal);

// Function to update the display with the saved account
function updateAccountDisplay() {
    const savedAccount = localStorage.getItem("selectedAccount");
    if (savedAccount) {
        document.getElementById("fromAccountTextContent").textContent = savedAccount;
    } else {
        document.getElementById("fromAccountTextContent").textContent = "No account selected";
    }
}

// Call updateAccountDisplay on page load to set the account
document.addEventListener('DOMContentLoaded', function() {
    updateAccountDisplay();
});

document.addEventListener('DOMContentLoaded', function() {
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));
    const container = document.getElementById('payBillForContainer');

    if (paymentData) {
        paymentData.forEach(data => {
            const billItem = document.createElement('div');
            billItem.classList.add('bill-item');

            billItem.innerHTML = `
                <p><strong>${data.companyName}</strong></p>
                <p>Account Number: ${data.accountNumber}</p>
                <p>Amount: ${data.amount}</p>
            `;
            container.appendChild(billItem);
        });
    } else {
        container.innerHTML = '<p>No selected billing companies found.</p>';
    }
});
function updateBillSummary(selectedBills) {
    const container = document.getElementById('payBillForContainer');
    container.innerHTML = '';  // Clear the previous content

    selectedBills.forEach(bill => {
        const billDiv = document.createElement('div');
        billDiv.classList.add('bill-detail');

        const billName = document.createElement('span');
        billName.classList.add('bill-name');
        billName.textContent = bill.name;

        const billAccount = document.createElement('span');
        billAccount.classList.add('account-number');
        billAccount.textContent = `Account: ${bill.billingAccount}`;

        const billAmount = document.createElement('span');
        billAmount.classList.add('amount');
        billAmount.textContent = `SGD ${bill.amount.toFixed(2)}`;

        billDiv.appendChild(billName);
        billDiv.appendChild(billAccount);
        billDiv.appendChild(billAmount);

        container.appendChild(billDiv);
    });
}

async function fetchBillData() {
    try {
        const response = await fetch('/api/bills'); // API endpoint to get bill data
        if (!response.ok) {
            throw new Error('Failed to fetch bill data');
        }
        const billData = await response.json(); // Parse the JSON response
        updateBillSummary(billData); // Update the bill summary with the fetched data

        // Now that the bills are added, call calculateTotal
        calculateTotal();
    } catch (error) {
        console.error(error.message);
    }
}

// Function to update the bill summary in the HTML
function updateBillSummary(billData) {
    const container = document.getElementById('payBillForContainer');
    container.innerHTML = ''; // Clear previous content

    billData.forEach(bill => {
        const billDiv = document.createElement('div');
        billDiv.classList.add('bill-detail');

        // Company name
        const billName = document.createElement('div');
        billName.classList.add('bill-name');
        billName.textContent = bill.BillingCompany;

        // Reference number (Account number)
        const billReference = document.createElement('div');
        billReference.classList.add('reference-number');
        billReference.textContent = `Reference: ${bill.BillingAccNo}`;

        // Bill amount
        const billAmount = document.createElement('div');
        billAmount.classList.add('amount');
        billAmount.textContent = `Amount: SGD ${parseFloat(bill.BillAmount).toFixed(2)}`;

        // Create a container for each bill item (flexbox layout)
        const billContentDiv = document.createElement('div');
        billContentDiv.classList.add('bill-content');

        // Append the elements to the container
        billContentDiv.appendChild(billName);
        billContentDiv.appendChild(billReference);
        billContentDiv.appendChild(billAmount);

        // Append the bill item to the main container
        billDiv.appendChild(billContentDiv);
        container.appendChild(billDiv);
    });
}

// Call the fetchBillData function when the page loads
document.addEventListener('DOMContentLoaded', fetchBillData);

let totalAmount = 0;

// Function to update the total when a checkbox is checked or unchecked
function updateSelection(company) {
    const checkbox = document.querySelector(`#${company} input[type="checkbox"]`);
    const amountSpan = document.querySelector(`#${company} .amount`);
    const amount = parseFloat(amountSpan.innerText.replace('SGD ', '').replace(',', ''));

    // Add or subtract the amount based on checkbox state
    if (checkbox.checked) {
        totalAmount += amount;
    } else {
        totalAmount -= amount;
    }

    // Update the total in the UI
    document.getElementById("total-amount").innerText = `Total: SGD ${totalAmount.toFixed(2)}`;
}

// Add event listeners for all checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        updateSelection(this.value);
    });
});

function updateSelection(company) {
    const checkbox = document.querySelector(`#${company} input[type="checkbox"]`);
    const amountSpan = document.querySelector(`#${company} .amount`);
    const amount = parseFloat(amountSpan.innerText.replace('SGD ', '').replace(',', ''));

    // Add or subtract the amount based on checkbox state
    if (checkbox.checked) {
        totalAmount += amount;
    } else {
        totalAmount -= amount;
    }

    // Update the total in the UI
    calculateTotal();  // Recalculate and update the total
}
