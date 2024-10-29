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


// Dark mode toggle script
document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});




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