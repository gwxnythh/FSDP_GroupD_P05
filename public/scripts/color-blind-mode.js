const logo = document.getElementById('logo'); // Assuming 'logo' is the ID of the logo image

// Function to apply the saved color-blind mode on page load
function applySavedColorBlindMode() {
    const savedMode = localStorage.getItem('colorBlindMode');
    
    // If no saved mode, default to 'none' (no color-blind mode)
    if (!savedMode) {
        changeColorBlindMode('none');  // Set default to 'none'
    } else {
        changeColorBlindMode(savedMode);
    }
}

// Function to change color-blind modes
function changeColorBlindMode(mode) {
    // Remove all existing color blind mode classes
    document.body.classList.remove('protanopia', 'deuteranopia', 'trianopia');
    
    // If "none" is selected, just remove any applied color-blind mode
    if (mode === 'none') {
        localStorage.removeItem('colorBlindMode');  // Remove the saved mode from localStorage
        logo.src = "images/ocbc_logo.png"; // Set logo to default
        return;
    }

    // Add the selected color-blind mode class
    document.body.classList.add(mode);

    // Change the logo based on the selected mode
    if (mode === 'protanopia' || mode === 'deuteranopia') {
        logo.src = "../images/ocbc_logo_protanopia&deuteranopia.png"; // For both Protanopia and Deuteranopia
    } else if (mode === 'trianopia') {
        logo.src = "../images/ocbc_logo_protanopia&deuteranopia.png"; // For Trianopia
    }

    // Save the current color-blind mode to localStorage
    localStorage.setItem('colorBlindMode', mode);
}

// Event listeners for the radio buttons
document.getElementById('none')?.addEventListener('change', function() {
    changeColorBlindMode('none');
    speak('Color blindness filter disabled');
});

document.getElementById('protanopia')?.addEventListener('change', function() {
    changeColorBlindMode('protanopia');
    speak('Protanopia mode enabled');
});

document.getElementById('deuteranopia')?.addEventListener('change', function() {
    changeColorBlindMode('deuteranopia');
    speak('Deuteranopia mode enabled');
});

document.getElementById('trianopia')?.addEventListener('change', function() {
    changeColorBlindMode('trianopia');
    speak('Trianopia mode enabled');
});

// Apply saved color-blind mode when the page is loaded
document.addEventListener("DOMContentLoaded", applySavedColorBlindMode);