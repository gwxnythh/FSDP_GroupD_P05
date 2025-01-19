//updated
async function fetchAccounts() {
    const accessCode = sessionStorage.getItem('accessCode'); // Retrieve access code

    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`);
        const data = await response.json();

        if (response.ok) {
            populateAccountDropdown(data);
            
        } else {
            console.error('Failed to fetch accounts:', data.message);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

async function fetchUser(){
    const accessCode = sessionStorage.getItem('accessCode'); // Retrieve access code
    try {
        const response = await fetch(`/accounts?accessCode=${accessCode}`);
        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }


}

async function populateAccountDropdown(accounts) {
    const dropdown = document.getElementById('account-dropdown');
    dropdown.innerHTML = ''; // Clear existing options

    // Add placeholder option
    const placeholder = document.createElement('option');
    placeholder.textContent = 'Select an account';
    placeholder.disabled = true;
    placeholder.selected = true;
    dropdown.appendChild(placeholder);

    // Populate with account options
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.AccountID;
        option.textContent = `${account.AccountType} - ${account.AccountNumber} (${account.Currency} ${account.Balance.toFixed(2)})`;
        dropdown.appendChild(option);
    });
}

// Fetch accounts when the page loads
document.addEventListener('DOMContentLoaded', fetchAccounts);


// Get references to radio buttons and the input fields container
const radioButtons = document.querySelectorAll('input[name="transfer-to"]');
const inputFields = document.getElementById('input-fields');

// Function to update input fields based on the selected transfer type
async function updateInputFields(value) {
    let inputHTML = ''; // Placeholder for dynamic inputs

    switch (value) {
        case 'mobile':
            inputHTML = `
                <input type="text" id="mobile-prefix" placeholder="+65" style="width: 20%;" disabled>
                <input type="text" id="mobile-number" placeholder="12345678" style="width: 35%;">
                <button class="button" type="button" id="mobile-search">Search</button>
                <div id="full-name-display" style="margin-top: 10px;"></div>`;
            break;

        case 'nric':
            inputHTML = `
                <input type="text" id="nric-number" placeholder="S1234567A" style="width: 55%;">
                <button class="button" type="button" id="nric-search">Search</button>`;
            break;

        case 'uen':
            inputHTML = `
                <input type="text" id="uen-number" placeholder="201912345W" style="width: 55%;">
                <button class="button" type="button" id="uen-search">Search</button>`;
            break;
    }

    // Update the input fields container with the new HTML
    inputFields.innerHTML = inputHTML;

    // Add event listener for the search button
    const searchButton = document.querySelector('#' + value + '-search');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (value === 'mobile') {
                const mobileNumber = document.getElementById('mobile-number').value;
                fetchUserByMobile(mobileNumber,true);

            }
            // Additional logic for NRIC and UEN can be added here
        });
    }
}


// Updated fetchUserByMobile to control when to speak the full name
async function fetchUserByMobile(mobileNumber, shouldSpeak = true) {
    const fullNameDisplay = document.getElementById('full-name-display');
    
    try {
        const response = await fetch(`/users/mobile?mobile=${mobileNumber}`);
        const data = await response.json();

        if (response.ok) {
            // Display full name and mobile number
            fullNameDisplay.textContent = `${data.fullName}\n +65${mobileNumber}`;
            fullNameDisplay.style.color = 'black';
            fullNameDisplay.style.fontWeight = 'bold';
            fullNameDisplay.style.whiteSpace = 'pre-line';

            // Trigger voice output for full name if shouldSpeak is true
            if (shouldSpeak) {
                speak("Full Name");
                speak(data.fullName); // Speak the full name
            }

            const result = await fetchUser();
            if (data.UserID == result[0].UserID) {
                fullNameDisplay.textContent = `Error: Please enter a different number`;
                fullNameDisplay.style.color = 'red';
                document.getElementById("mobile-number").value = "";
                console.error("Cannot transfer to own number");
            }

            return data.UserID;

        } else {
            console.error('Failed to fetch user:', data.message);
            fullNameDisplay.textContent = 'User not found.';
            fullNameDisplay.style.color = 'red'; // Set text color to red
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        fullNameDisplay.textContent = 'Error fetching user information.';
        fullNameDisplay.style.color = 'red'; // Set text color to red
    }
}



async function getBalance(accountID) {
    try {
        const response = await fetch(`/accounts/balance/${accountID}`);
        if (response.ok) {
            const data = await response.json();
            //console.log("Account balance:", data);
            return data.balance; // Return the balance
        } else {
            const errorMessage = await response.text();
            console.error("Error fetching balance:", errorMessage);
            return null;
        }
    } catch (error) {
        console.error("Network error:", error);
        return null;
    }
}   

async function fetchCurrentAcc(mobileNumber){
    try {
        const response = await fetch(`/accounts/mobile/${mobileNumber}`);

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error fetching account:", errorMessage);    
        }
        const accountData = await response.json();
        return accountData.AccountID;
        console.log("Account data:", accountData);
        
    } catch (error) {
        console.error('Error fetching user:', error);
 
    }
}

async function summarizePayment(TransferType, TransferTo, FromAccountID, FromAccountTextContent, Amount, Purpose, Description) {
    try {
        const payload = JSON.stringify({
            TransferType,
            TransferTo,
            FromAccountID,
            FromAccountTextContent,
            Amount,
            Purpose,
            Description
        })
        const response = await fetch("/transactions/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        });
        if (response.ok) {

            window.location = "/paynow-summary.html?payload=" + payload;

        } else {
            // Handle errors from the server
            const errorData = await response.json();
            console.error("Error creating transaction:", errorData.message);
            alert(`Error: ${errorData.message}`);
        }      
    }catch (error) {
        console.log('error: ', error);
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
            console.log("Transaction result:", result);
            alert(`Transaction ${result.status}: ${result.message}`);
        } else {
            // Handle errors from the server
            const errorData = await response.json();
            console.error("Error creating transaction:", errorData.message);
            alert(`Error: ${errorData.message}`);
        }      
    }catch (error) {
        
    }
}
// Set initial transfer limit if not already set
if (!localStorage.getItem("transferlimit")) {
    localStorage.setItem("transferlimit", 5000);  
}
let transferlimit = parseFloat(localStorage.getItem("transferlimit"));

async function updateLimit(){
    
    const amount = document.getElementById("amount").value;
    transferlimit = transferlimit - amount;
    localStorage.setItem("transferlimit", transferlimit);
    limit = document.getElementById("transferlimit");
    limit.textContent = `Remaining transferrr limit: SGD ${transferlimit.toFixed(2)}`;

}

async function checkAmountLimit() {
    const amountInput = document.getElementById("amount");
    const errorMessage = document.getElementById("transferlimit");
    const submitButton = document.getElementById("next-button");
    const accID =  document.getElementById("account-dropdown").value;
    const balance = await getBalance(accID);
    const amountValue = parseFloat(amountInput.value);

    //console.log("wewewe", accID,balance);
    //console.log("limitt",transferlimit);

    if (amountValue > transferlimit || amountValue > balance) {
        // Show error message and disable the button
        errorMessage.style.color= "red";
        submitButton.disabled = true;
        submitButton.style.backgroundColor = "lightgray"
        //console.log("reach transfer limit")
    } else {//success
        // Hide error message and enable the button if under the limit
        submitButton.disabled = false;
        errorMessage.style.color= "black";
        submitButton.style.backgroundColor = "grey"


    }
}

// Attach the function to the input event

document.getElementById("amount").addEventListener("input", checkAmountLimit);




if (document.getElementById("next-button")) {
    document.getElementById("next-button").addEventListener("click", async() => {
        // Retrieve values from form inputs
        const transferType = document.querySelector('input[name="transfer-to"]:checked').value;
        console.log('transferType: ', transferType);
        let transferTo = '';
        const fullNameDisplay = document.getElementById('full-name-display');
        // TODO: handle to uen and NRIC to get toAccountId
        if (transferType == 'mobile') {
            transferTo = document.getElementById('mobile-number').value;
            const result1 = await fetchUser();
            const result2 = await fetchUserByMobile(transferTo,false);
            
            //compare fromUser and toUser
            if (result1 == result2){
                fullNameDisplay.textContent = `Error: Please enter a different number`;
                fullNameDisplay.style.color = 'red'; 
                document.getElementById("mobile-number").value="";
                console.error("cannot transfer to own number");
                
            }
            transferTo = document.getElementById('mobile-number').value;
        } else if (transferType == 'nric') {
            transferTo = document.getElementById('nric-number').value;
        } else if (transferType == 'uen') { 
            transferTo = document.getElementById('uen-number').value;
        }
        
        const fromAccount = document.getElementById("account-dropdown");
        const fromAccountID = fromAccount.value;    
        const fromAccountTextContent = fromAccount.options[fromAccount.selectedIndex].textContent;  
        const amount = document.getElementById("amount").value;
        const purpose = document.getElementById("purpose").value;
        const description = document.getElementById("description").value;
        

        console.log('transferTo: ', transferTo);
        console.log('fromAccountID: ', fromAccountID);
        console.log('fromAccountTextContent: ', fromAccountTextContent);
        console.log('amount: ', amount);
        console.log('purpose: ', purpose);
        console.log('description: ', description);
        // Call summarizePayment with the retrieved values
        updateLimit()
        summarizePayment(transferType, transferTo, fromAccountID, fromAccountTextContent, amount, purpose, description);
    });
}

// Add event listeners to radio buttons
radioButtons.forEach((radio) => {
    radio.addEventListener('change', (event) => {
        updateInputFields(event.target.value);
    });
});

// Set initial state based on the default checked radio button
window.onload = () => {
    const selectedRadio = document.querySelector('input[name="transfer-to"]:checked');
    updateInputFields(selectedRadio.value);
    limit = document.getElementById("transferlimit");
    limit.textContent = `Remaining transfer limit: SGD ${transferlimit.toFixed(2)}`;

};
