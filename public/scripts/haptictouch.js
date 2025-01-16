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

// Preload sound
const clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-30.mp3");

// Function to play sound and redirect
function handleClick(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Check if Haptic Touch is enabled before playing the sound
    if (isHapticTouchEnabled()) {
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
    } else {
        console.log("Haptic Touch is disabled. No sound played.");
    }
}

// Function to check if Haptic Touch is enabled
function isHapticTouchEnabled() {
    let hapticTouch = localStorage.getItem("hapticTouch");
    console.log('Haptic Touch Status:', hapticTouch);
    return hapticTouch === 'true';
}

document.addEventListener("DOMContentLoaded", () => {
    // Check if Haptic Touch is enabled before playing the sound
    if (isHapticTouchEnabled()) {
        // Select all clickable elements
        const clickableElements = document.querySelectorAll("a, button, .shortcut-item, .action-item, .header-icons button, .clickable-with-haptic");

        // Add event listeners to clickable elements
        clickableElements.forEach(element => {
            // If the element is a link, store the href in a data attribute
            if (element.tagName === "A" && element.getAttribute("href")) {
                element.setAttribute("data-url", element.getAttribute("href"));
                element.removeAttribute("href"); // Remove href to prevent default behavior
            }
            element.addEventListener("click", handleClick);
        });
    }
});
