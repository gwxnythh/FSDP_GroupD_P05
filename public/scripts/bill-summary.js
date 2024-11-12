function calculateTotal() {
    const billAmounts = document.querySelectorAll('.bill-amount');
    let total = 0;

    // Sum up each amount by parsing the number from the text content
    billAmounts.forEach(bill => {
        const amountText = bill.textContent.replace("SGD", "").trim();
        const amount = parseFloat(amountText);
        total += amount;
    });

    // Display the total amount
    document.getElementById('total-amount').textContent = `Total: SGD ${total.toFixed(2)}`;
}

// Call the function to calculate and display the total on page load
calculateTotal();
