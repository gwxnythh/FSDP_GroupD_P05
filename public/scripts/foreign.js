
const form = document.getElementById("converterForm");
const resultDiv = document.getElementById("result");
const rateInfoDiv = document.getElementById("rateInfo");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const recipientInput = document.getElementById("recipient");
const recipientError = document.getElementById("recipientError");
const confirmationDiv = document.getElementById("confirmation");
const convertButton = document.getElementById("convertButton");
const confirmButton = document.getElementById("confirmButton");
const transferButton = document.getElementById("transferButton");
const API_URL = "https://api.freecurrencyapi.com/v1/latest";
const API_KEY = "fca_live_Ajltep1DtAHXWB69bmhBMY5RERL2X79KS66Yd1mQ";

// Fetch and populate currency options
async function populateCurrencies() {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}`);
        const data = await response.json();

        if (data && data.data) {
            for (const currency in data.data) {
                const optionFrom = document.createElement("option");
                const optionTo = document.createElement("option");
                optionFrom.value = currency;
                optionTo.value = currency;
                optionFrom.textContent = currency;
                optionTo.textContent = currency;
                fromCurrencySelect.appendChild(optionFrom);
                toCurrencySelect.appendChild(optionTo);
            }
        } else {
            throw new Error("Invalid response from API.");
        }
    } catch (error) {
        alert("Error fetching currency list. Please try again later.");
        console.error(error);
    }
}

// Function to validate Singaporean phone number or NRIC
function validateRecipient(input) {
    const phoneRegex = /^[89]\d{7}$/;
    const nricRegex = /^[ST]\d{7}[A-Z]$/i;
    return phoneRegex.test(input) || nricRegex.test(input);
}

// Function to convert currency
async function convertCurrency(amount, fromCurrency, toCurrency) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&base_currency=${fromCurrency}&currencies=${toCurrency}`);
        const data = await response.json();

        if (data && data.data && data.data[toCurrency]) {
            const rate = data.data[toCurrency];
            const convertedAmount = amount * rate;

            rateInfoDiv.textContent = `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`;
            resultDiv.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
            confirmationDiv.style.display = "block";
        } else {
            throw new Error("Invalid response from API.");
        }
    } catch (error) {
        alert("Error fetching exchange rate. Please try again later.");
        console.error(error);
    }
}

// Event listener for convert button
convertButton.addEventListener("click", async () => {
    const amount = document.getElementById("amount").value;
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const recipient = recipientInput.value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (fromCurrency === toCurrency) {
        alert("Please select different currencies to convert.");
        return;
    }

    if (!validateRecipient(recipient)) {
        recipientError.style.display = "block";
        return;
    } else {
        recipientError.style.display = "none";
    }

    await convertCurrency(amount, fromCurrency, toCurrency);
});

// Event listener for confirmation button
confirmButton.addEventListener("click", () => {
    alert("Transfer confirmed! Proceeding with the transfer...");
    transferButton.disabled = false;
});

// Event listener for form submission
form.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Transfer completed successfully!");
});

// Populate currencies on page load
populateCurrencies();
