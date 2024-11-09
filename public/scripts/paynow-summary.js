var paymentDetail;
async function fetchCurrentAccById(accountId){
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
            return data
        } else {
            console.error('Failed to fetch user:', data.message);
        }
        
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function makePayment(FromAccountID,ToAccountID,Amount,Description) {
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
        if (response.ok) {
            // Parse and display the success message
            const result = await response.json();
            console.log('result: ' + JSON.stringify(result.status.newReferenceNo))
            document.getElementById("alert-banner").style.display = "flex";
            document.getElementById("submit-button").style.display = "none";
            document.getElementById("reference-number").textContent = result.status.newReferenceNo
            // console.log("Transaction result:", result);
            // alert(`Transaction ${result.status}: ${result.message}`);
        } else {
            // Handle errors from the server
            const errorData = await response.json();
            console.error("Error creating transaction:", errorData.message);
            alert(`Error: ${errorData.message}`);
        }      
    }catch (error) {
        
    }
}


if (document.getElementById("submit-button")) {
    document.getElementById("submit-button").addEventListener("click", async() => {
        let mobileNumber;
        // TODO: handle for UEN and NRIC
        if (paymentDetail.TransferType === 'mobile') {
            mobileNumber = paymentDetail.TransferTo;
        }
        
        const fromAccountID = paymentDetail.FromAccountID;
        const toAccountID =  paymentDetail.toAccountUser.AccountID;
        const amount = paymentDetail.Amount;
        const description = paymentDetail.Description;
        console.log(fromAccountID,toAccountID,amount,description);
        // Call makePayment with the retrieved values
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
}

// Set initial state based on the default checked radio button
window.onload = () => {
    // Get the query string
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const payload = urlParams.get('payload');
    if (payload) {
        const transferDetails = JSON.parse(payload);
        populateSummary(transferDetails)
    }
};
