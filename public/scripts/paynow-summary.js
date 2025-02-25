var paymentDetail;

async function fetchCurrentAccById(accountId) {
    try {
        const response = await fetch(`/users/id?id=${accountId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error fetching account:", errorMessage);
        }
        const accountData = await response.json();
        console.log("Account data:", accountData);
        return accountData;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

// Function to close the alert
function closeAlert() {
    var alert = document.getElementById("alert-banner");
    alert.style.display = "none";
}

// Function to fetch user details by mobile number
async function fetchUserByMobile(mobileNumber) {
    const fullNameDisplay = document.getElementById('full-name-display');
    try {
        const response = await fetch(`/users/mobile?mobile=${mobileNumber}`);
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            console.error('Failed to fetch user:', data.message);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function makePayment(FromAccountID, ToAccountID, Amount, Description) {
    try {
        const response = await fetch("/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                FromAccountID,
                ToAccountID,
                Amount,
                Description
            })
        });

        const result = await response.json(); // Parse the response
        console.log("Transaction status:", result.transactionStatus);

        const alertBanner = document.getElementById("alert-banner");
        const referenceNumber = document.getElementById("reference-number");
        const successIcon = alertBanner.querySelector(".fa-check");
        const errorIcon = alertBanner.querySelector(".fa-times");

        // Reset icons visibility for each transaction
        successIcon.style.display = "none";
        errorIcon.style.display = "none";

        // Handle transaction status
        if (response.ok && result.transactionStatus === 'Completed') {
            console.log("Transaction completed successfully.");
            alertBanner.classList.remove("error");
            alertBanner.classList.add("success");
            alertBanner.style.display = "flex";
            document.getElementById("submit-button").style.display = "none";
            referenceNumber.textContent = "Reference-number: " + result.newReferenceNo;
            successIcon.style.display = "inline-block";
            speak("Your transfer is successful.");
        } else {
            console.log("Transaction failed.");
            alertBanner.classList.remove("success");
            alertBanner.classList.add("error");
            alertBanner.style.display = "flex";
            alertBanner.style.alignItems = "center";
            alertBanner.style.zIndex = "999";
            alertBanner.querySelector("strong").textContent = result.message || "Your transfer is unsuccessful.";
            errorIcon.style.display = "inline-block";
            speak("Your transfer is unsuccessful.");
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        speak("There was an error with your transaction.");
    }
}


if (document.getElementById("submit-button")) {
    document.getElementById("submit-button").addEventListener("click", async () => {
        speak("Submit");
        await waitForVoiceToFinish();

        let mobileNumber;
        if (paymentDetail.TransferType === 'mobile') {
            mobileNumber = paymentDetail.TransferTo;
        }

        const fromAccountID = paymentDetail.FromAccountID;
        const toAccountID = paymentDetail.toAccountUser.AccountID;
        const amount = paymentDetail.Amount;
        const description = paymentDetail.Description;
        console.log(fromAccountID, toAccountID, amount, description);

        makePayment(fromAccountID, toAccountID, amount, description);
    });
}

async function populateSummary(transferDetails) {
    document.getElementById("fromAccountTextContent").textContent = transferDetails.FromAccountTextContent;
    let toAccountUser = '';
    if (transferDetails.TransferType === 'mobile') {
        toAccountUser = await fetchUserByMobile(transferDetails.TransferTo);
    }

    document.getElementById("mobile-number").textContent = transferDetails.TransferTo;
    document.getElementById("name").textContent = toAccountUser.FullName;
    document.getElementById("amount").textContent = transferDetails.Amount;
    document.getElementById("purpose").textContent = transferDetails.Purpose;
    document.getElementById("description").textContent = transferDetails.Description;

    paymentDetail = transferDetails;
    paymentDetail.toAccountUser = toAccountUser;
    // Save all necessary details for the shortcut
    localStorage.setItem("latestPayment", JSON.stringify({
        FromAccountTextContent: transferDetails.FromAccountTextContent,
        FromAccountID: transferDetails.FromAccountID, // Correct ID for the sender
        ToAccountID: toAccountUser.AccountID, // Correct ID for the recipient
        FullName: toAccountUser.FullName,
        MobileNumber: transferDetails.TransferTo
    }));    

    // Format the mobile number as individual digits
    const formattedMobileNumber = transferDetails.TransferTo.split('').join(' ');

    // Update the confirmation text to read the mobile number as individual digits
    const confirmationText = `Do you want to transfer ${transferDetails.Amount} dollars to ${toAccountUser.FullName} of mobile number ${formattedMobileNumber}? Click submit to confirm.`;
    speak(confirmationText);
}


// Set initial state based on the default checked radio button
window.onload = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const payload = urlParams.get('payload');
    if (payload) {
        const transferDetails = JSON.parse(payload);
        populateSummary(transferDetails);
    }
};

// Function to handle voice output
function speak(text) {
    // if voice over is disabled, don't process
    if (!isVoiceOverEnabled()) {
        return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
    console.log("Speaking:", text);
}

// check if user enable voice over
function isVoiceOverEnabled() {
    let voiceOver = localStorage.getItem("voiceOver");
    if (voiceOver) {
        return voiceOver === 'true';
    }
    return false;
}


// Helper function to wait for voice to finish
function waitForVoiceToFinish() {
    return new Promise((resolve) => {
        const synth = window.speechSynthesis;
        const checkSpeechEnd = setInterval(() => {
            if (!synth.speaking) {
                clearInterval(checkSpeechEnd);
                resolve();
            }
        }, 100);
    });
}
