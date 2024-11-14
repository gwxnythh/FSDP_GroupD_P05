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


// Dark mode toggle script with voice output
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
        speak('Dark mode enabled')
    } else {
        localStorage.setItem('darkMode', 'disabled');
        speak('Dark mode disabled')
    }
});

// Check for dark mode preference in localStorage and apply it
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// Function to trigger voice output
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
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

/*
// Preload sound
const clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-30.mp3");

// Function to play sound and redirect
function handleClick(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the target URL from data attribute if it exists
    const targetUrl = event.currentTarget.getAttribute("data-url");

    // Reset and play the sound
    clickSound.currentTime = 0;
    clickSound.play();

    // Redirect after the sound finishes playing
    clickSound.onended = () => {
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    // Select all clickable elements
    const clickableElements = document.querySelectorAll("a, button, .shortcut-item, .action-item, .header-icons button");

    // Add event listeners to clickable elements
    clickableElements.forEach(element => {
        // If the element is a link, store the href in a data attribute
        if (element.tagName === "A" && element.getAttribute("href")) {
            element.setAttribute("data-url", element.getAttribute("href"));
            element.removeAttribute("href"); // Remove href to prevent default behavior
        }
        element.addEventListener("click", handleClick);
    });
});
*/
