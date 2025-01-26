document.addEventListener("DOMContentLoaded", () => {
    const latestPayment = JSON.parse(localStorage.getItem("latestPayment")); // Retrieve the latest payment details
    const amountInput = document.getElementById("amount");
    const descriptionInput = document.getElementById("description");
    const nextButton = document.getElementById("next-button");

    // Populate recipient details if available
    if (latestPayment) {
        document.getElementById("recipient-name").textContent = `Name: ${latestPayment.FullName || "Unknown"}`;
        document.getElementById("recipient-mobilenumber").textContent = `Mobile Number: ${latestPayment.MobileNumber || "N/A"}`;
    } else {
        document.getElementById("recipient-name").textContent = "Name: No recent payment found";
        document.getElementById("recipient-mobilenumber").textContent = "Mobile Number: N/A";
    }

    // Event listener for the "Next" button
    nextButton.addEventListener("click", async () => {
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value || "PayNow Transfer";

        // Validate the amount input
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        // Ensure valid FromAccountID and ToAccountID
        if (!latestPayment || !latestPayment.FromAccountID || !latestPayment.ToAccountID) {
            alert("Invalid payment details.");
            return;
        }

        const fromAccountID = latestPayment.FromAccountID;
        const FromAccountTextContent = latestPayment.FromAccountTextContent
        const toAccountID = latestPayment.ToAccountID;

        // Summarize the payment using the existing function
        summarizePayment(
            "mobile", // Assuming "mobile" is the transfer type
            latestPayment.MobileNumber,
            fromAccountID,
            FromAccountTextContent, // Example for `FromAccountTextContent`
            amount,
            "PayNow Transfer", // Purpose (optional; update as needed)
            description
        );
    });
});
