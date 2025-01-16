function changeFontScale(action) {
    let currentScale = localStorage.getItem("font-size");
    if (!currentScale) {
        currentScale = 1;
    }
    console.log('changeFontScale: ', action)
    switch (action) {
        case 'increase':
            currentScale *= 1.2;  // Scale up by 20%
            break;
        case 'decrease':
            currentScale *= 0.8;  // Scale down by 20%
            break;
        case 'reset':
            currentScale = 1;  // Reset to original scale
            break;
        default:
            break;
    }

    if (currentScale < 1) {
        currentScale = 1;
    }

    // Update the --font-scale CSS variable
    document.documentElement.style.setProperty('--font-scale', currentScale);
    localStorage.setItem("font-size", currentScale);
}

function remToPxDynamic(rem) {
    const rootFontSize = getRootFontSize();
    return rem * rootFontSize;
}

function getFontSizeUnit(element) {
    const fontSize = window.getComputedStyle(element).fontSize;  // Get computed font size
    const unit = fontSize.replace(/[0-9.]/g, '');  // Extract the unit by removing the number part
    return unit;
  }

/* Display Account(s) Dropdown */
function toggleAccounts() {
    const accountsList = document.getElementById('accountsList');
    const accountHeader = document.querySelector('.account-header');

    accountsList.classList.toggle('show');
    accountHeader.classList.toggle('active');
}

function openNav() {
    document.getElementById("sideNav").style.width = "250px"; // Adjust width as necessary
    document.body.classList.add("nav-open"); // Add class to adjust padding
}

function closeNav() {
    document.getElementById("sideNav").style.width = "0";
    document.body.classList.remove("nav-open"); // Remove class to reset padding
}

function resetlimit() {
    localStorage.setItem("transferlimit", 5000);
}


// Function to trigger voice output
function speak(text) {
    // if voice over is disabled, don't process
    if (!isVoiceOverEnabled()) {
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// check if user enable voice over
function isVoiceOverEnabled() {
    let voiceOver = localStorage.getItem("voiceOver");
    if (voiceOver) {
        return voiceOver === 'true';
    }
    return false;
}


/* Logout button logic with single and double-click functionality */
const logoutButton = document.getElementById('header-logout-btn'); // Get the Logout button by its ID

if (logoutButton) {
    let clickTimeout; // Variable to manage single and double-click timing

    // Single click: Voice output "Log out"
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent immediate navigation
        if (clickTimeout) clearTimeout(clickTimeout); // Clear any existing timeout

        // Set a timeout to handle single click separately
        clickTimeout = setTimeout(() => {
            speak("Log out");
        }, 200); // Set a short delay for single-click action
    });

    // Double click: Navigate to login page and execute resetlimit
    logoutButton.addEventListener('dblclick', (event) => {
        event.preventDefault(); // Prevent any ongoing single-click action
        clearTimeout(clickTimeout); // Cancel single-click timeout
        resetlimit(); // Execute resetlimit function
        window.location.href = 'login.html'; // Redirect to login page on double click
    });
}

/* Dark mode toggle script with voice output */
let darkModeTimeout; // Variable to store the timeout for double-click detection

document.getElementById('darkModeToggle').addEventListener('click', function() {
    // Play voice output on single click
    speak('Dark mode');

    // Clear the timeout if double-click happens
    clearTimeout(darkModeTimeout);

    // Set timeout to toggle dark mode after double-click detection
    darkModeTimeout = setTimeout(() => {
        // This block will execute after a single click if no double-click occurs
    }, 300); // Delay to detect double click
});

document.getElementById('darkModeToggle').addEventListener('dblclick', function() {
    // Toggle dark mode on double-click
    document.body.classList.toggle('dark-mode');

    // Save the current dark mode state to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        speak('Dark mode enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
        speak('Dark mode disabled');
    }
});

// Check for dark mode preference in localStorage and apply it
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

/* PayNow Page Payment to */
document.querySelectorAll('input[name="transfer-to"]').forEach((radio) => {
    radio.addEventListener('change', function() {
        const inputFields = document.getElementById('input-fields');
        inputFields.innerHTML = ''; // Clear existing input fields
        
        if (this.value === 'mobile') {
            inputFields.innerHTML = `
                <input type="text" placeholder="+65" style="width: 20%;" disabled>
                <input type="text" placeholder="12345678" style="width: 35%;">
                <button class="button" type="button">Search</button>
            `;
        } else if (this.value === 'nric') {
            inputFields.innerHTML = `
                <input type="text" placeholder="S1234567D" style="width: 60%;">
                <button class="button" type="button">Search</button>
            `;
        } else if (this.value === 'uen') {
            inputFields.innerHTML = `
                <input type="text" placeholder="123456789W" style="width: 60%;">
                <button class="button" type="button">Search</button>
            `;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const increaseButton = document.getElementById('increaseFont');
    const decreaseButton = document.getElementById('decreaseFont');

    let currentScale = localStorage.getItem("font-size");
    if (!currentScale) {
        currentScale = 1;
    }
    // Update the --font-scale CSS variable
    document.documentElement.style.setProperty('--font-scale', currentScale);

    // Add event listeners to buttons
    if (increaseButton) {
        increaseButton.addEventListener('click', function() {
            changeFontScale('increase');
        });
    }

    if (decreaseButton) {
        decreaseButton.addEventListener('click', function() {
            changeFontScale('decrease');
        });
    }
    
});