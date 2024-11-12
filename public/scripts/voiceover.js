// Initialize the speech synthesis API
const synth = window.speechSynthesis;

// Function to handle voice output
function speak(text) {
    if (synth.speaking) {
        synth.cancel(); // Cancel any ongoing speech to override it
        console.log('Previous speech cancelled to prioritize new speech');
    }
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
    console.log("Speaking:", text);  // Log the spoken text
}

// Event listener for shortcut and header links
window.addEventListener("load", () => {  // Changed from DOMContentLoaded to load
    // Define the links with their text for voice output and CSS selectors
    const links = [
        { selector: "a[href='index.html']", text: "View Accounts" },
        { selector: "a[href='transfers.html']", text: "Transfers" },
        { selector: "a[href='transaction.html']", text: "Transactions" },
        { selector: "a[href='paynow.html']", text: "PayNow" }
    ];

    // Handle navigation links for voiceover and navigation
    links.forEach(link => {
        const elements = document.querySelectorAll(link.selector);

        if (elements) {
            elements.forEach(element => {
                let clickTimeout;

                element.addEventListener("click", (event) => {
                    event.preventDefault();
                    if (clickTimeout) clearTimeout(clickTimeout);

                    clickTimeout = setTimeout(() => {
                        speak(link.text);
                    }, 200); // 200ms delay to differentiate single click
                });

                element.addEventListener("dblclick", (event) => {
                    event.preventDefault();
                    clearTimeout(clickTimeout);
                    window.location.href = link.selector.split("'")[1]; // Redirect to the respective page
                });
            });
        }
    });

    // Voiceover for account dropdown
    const accountDropdown = document.getElementById('account-dropdown');
    let isAccountSelected = false; // Flag to track if an account is selected

    if (accountDropdown) {
        // First click or focus on the dropdown (triggered when user clicks it)
        accountDropdown.addEventListener('click', () => {
            if (!isAccountSelected) {
                speak("Select an account");
            }
            setTimeout(() => {
                accountDropdown.focus();  // Ensure dropdown opens after voiceover
            }, 200); // Slight delay to allow voiceover to finish

            // Reset the flag when dropdown is clicked to allow speaking the prompt again
            isAccountSelected = false;
        });

        // Listen for account selection change
        accountDropdown.addEventListener('change', () => {
            const selectedOption = accountDropdown.options[accountDropdown.selectedIndex];
            if (selectedOption && selectedOption.value !== '') {
                isAccountSelected = true;  // Mark that an account has been selected

                const accountType = selectedOption.textContent.split(' - ')[0]; // Extract account type

                // Immediately override any ongoing speech with account type voice output
                if (accountType.toLowerCase() === 'current') {
                    speak("Current account");
                } else if (accountType.toLowerCase() === 'savings') {
                    speak("Savings account");
                } else {
                    speak(accountType + " account");
                }
            }
        });
    }

    // Voice output for mobile number input placeholder in PayNow form
    const mobileNumberInput = document.querySelector("input[placeholder='12345678']");

    if (mobileNumberInput) {
        console.log("Mobile number input found");
        mobileNumberInput.addEventListener('click', () => {
            console.log("Mobile number input clicked");  // Log click for debugging
            speak("Enter mobile number");
        });
    } else {
        console.log("Mobile number input not found");  // Log if input is missing
    }

    // Voiceover for Search button
    const searchButton = document.querySelector(".button[type='button']"); // Assuming the button has class 'button' and type 'button'

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            speak("Search");
        });
    }

    // Voiceover for amount input field
    const amountInput = document.getElementById('amount'); // Get the amount input field by its ID
    let previousValueAmount = ''; // Track the previous value of the amount input field

    if (amountInput) {
        // When the amount input field is clicked or focused, speak "Enter amount"
        amountInput.addEventListener('click', () => {
            speak("Enter amount");
        });

        // Speak each number entered into the amount input field
        amountInput.addEventListener('input', () => {
            const enteredValue = amountInput.value;  // Get the current value of the input

            // Check if the entered value is different from the previous value
            if (enteredValue !== previousValueAmount) {
                const newDigits = enteredValue.slice(previousValueAmount.length); // Get the new digits entered

                // Speak each new digit entered (if any)
                newDigits.split('').forEach(digit => {
                    if (!isNaN(digit) && digit !== ' ') { // Ensure the character is a number
                        speak(digit); // Speak the number
                    }
                });

                previousValueAmount = enteredValue; // Update the previous value to the current value
            }
        });
    }

    // Voiceover for description input field
    const descriptionInput = document.getElementById('description'); // Get the description input field by its ID
    let previousValueDescription = ''; // Track the previous value of the description input field

    if (descriptionInput) {
        // When the description input field is clicked or focused, speak "Description"
        descriptionInput.addEventListener('click', () => {
            speak("Description");
        });

        // Speak each letter entered into the description input field
        descriptionInput.addEventListener('input', () => {
            const enteredValue = descriptionInput.value;  // Get the current value of the input

            // Check if the entered value is different from the previous value
            if (enteredValue !== previousValueDescription) {
                const newLetters = enteredValue.slice(previousValueDescription.length); // Get the new letters entered

                // Speak each new letter entered (if any)
                newLetters.split('').forEach(letter => {
                    speak(letter); // Speak the letter
                });

                previousValueDescription = enteredValue; // Update the previous value to the current value
            }
        });
    }

    // Voiceover for the "Next" button
    const nextButton = document.getElementById('next-button'); // Get the Next button by its ID

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            speak("Next");
        });
    }

    // Event listener for submit button
    const submitButton = document.getElementById('submit-button'); // Get the submit button by its ID
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            speak("Submit"); // Voice output "Submit" when the button is clicked
        });
    }
});
