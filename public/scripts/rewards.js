document.addEventListener('DOMContentLoaded', async () => {
    const accessCode = sessionStorage.getItem('accessCode');
    
    // Clear AccountID for fresh fetch
    sessionStorage.removeItem('AccountID');

    const accountId = await getAccountIDIfNeeded(accessCode);
    if (accountId) {
        await getCurrentAccountPoints(accountId);
    } else {
        console.error("Unable to retrieve account data. Please log in again.");
        document.getElementById('balanceAmount').textContent = "Points unavailable";
    }
});

// Retrieve the first AccountID if not already stored
async function getAccountIDIfNeeded(accessCode) {
    let accountId = sessionStorage.getItem('AccountID');
    if (!accountId && accessCode) {
        try {
            const response = await fetch(`/accounts?accessCode=${accessCode}`);
            if (!response.ok) throw new Error("Failed to fetch accounts.");

            const accounts = await response.json();
            if (accounts && accounts.length > 0) {
                accountId = accounts[0].AccountID; // Use the first account by default
                sessionStorage.setItem('AccountID', accountId);
            } else {
                console.error("No accounts found for the given access code.");
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    }
    return accountId;
}

// Fetch and display points for the current account
async function getCurrentAccountPoints(accountId) {
    try {
        const response = await fetch(`/accounts/points/${accountId}`);
        if (!response.ok) throw new Error(`Failed to fetch points for AccountID: ${accountId}`);

        const { points } = await response.json();
        if (points !== undefined) {
            document.getElementById('balanceAmount').textContent = `${points} Points`;
        } else {
            document.getElementById('balanceAmount').textContent = "Points unavailable";
        }
    } catch (error) {
        console.error("Error fetching points:", error);
        document.getElementById('balanceAmount').textContent = "Points unavailable";
    }
}

// scripts/rewards.js
async function fetchRewards() {
    try {
        const response = await fetch('/rewards'); // Fetch all rewards from the backend
        if (!response.ok) {
            throw new Error('Failed to fetch rewards');
        }

        const rewards = await response.json();
        renderRewards(rewards); // Render rewards on the page
    } catch (error) {
        console.error('Error fetching rewards:', error);
    }
}

function renderRewards(rewards) {
    const vouchersGrid = document.querySelector('.vouchers-grid');
    vouchersGrid.innerHTML = ''; // Clear existing content

    rewards.forEach(reward => {
        // Create the voucher card dynamically
        const voucherCard = document.createElement('div');
        voucherCard.classList.add('voucher-card');

        voucherCard.innerHTML = `
            <img src="${reward.image_path}" alt="${reward.CompanyName}" class="voucher-image">
            <div class="voucher-details">
                <h4>${reward.Description}</h4>
                <p class="voucher-description">Offered by: ${reward.CompanyName}</p>
                <p class="voucher-points">Redeem for <strong>${reward.PointsRequired} points</strong></p>
                <p class="voucher-expiration">Expires on: <strong>${new Date(reward.ExpiryDate).toLocaleDateString()}</strong></p>
                <button class="redeem-btn" data-reward-id="${reward.RewardID}">Redeem Now</button>
            </div>
        `;

        vouchersGrid.appendChild(voucherCard);
    });

    // Add click listeners to all "Redeem Now" buttons
    document.querySelectorAll('.redeem-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const rewardId = event.target.dataset.rewardId;
            await handleRewardRedemption(rewardId);
        });
    });
}

async function handleRewardRedemption(rewardId) {
    const accountId = sessionStorage.getItem('AccountID');
    if (!accountId) {
        alert("Account ID is not available. Please log in again.");
        return;
    }

    try {
        const response = await fetch('/rewards/redeem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accountId, rewardId })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const result = await response.json();
        alert(result.message);

        if (result.qrCode) {
            displayQRCode(result.qrCode);
        }

        // Update points balance after redemption
        await getCurrentAccountPoints(accountId);
    } catch (error) {
        console.error("Error redeeming reward:", error);
        alert("Failed to redeem reward. Please try again.");
    }
}


function displayQRCode(qrCodeBase64) {
    const qrModal = document.getElementById('qrModal');
    const qrCodeImage = document.getElementById('qrCodeImage');

    // Set QR code image source
    qrCodeImage.src = qrCodeBase64;

    // Show QR code modal
    qrModal.style.display = 'flex';

    // Automatically hide QR code modal after 3 seconds
    setTimeout(() => {
        qrModal.style.display = 'none';
        showSuccessMessage(); // Show the success modal after QR code disappears
    }, 8000);
}

function showSuccessMessage() {
    const successModal = document.getElementById('successModal');
    const closeSuccessModalBtn = document.getElementById('closeSuccessModal');

    // Show the modal
    successModal.style.display = 'flex';

    // Close the modal when the close button is clicked
    closeSuccessModalBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    // Optional: Close the modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

async function deleteRewardFromFrontend(rewardId) {
    console.log("Deleting reward with ID:", rewardId); // Debugging

    try {
        const response = await fetch(`/rewards/${rewardId}`, {
            method: "DELETE",
        });

        // Log raw response
        const rawResponse = await response.text();
        console.log("Raw server response:", rawResponse);

        if (!response.ok) {
            throw new Error("Failed to delete reward");
        }

        let data;
        try {
            data = JSON.parse(rawResponse); // Check for JSON
            console.log(data.message);
        } catch {
            console.warn("Response is not valid JSON");
        }

        // Remove the reward from the DOM
        const rewardElement = document.getElementById(`reward-${rewardId}`);
        if (rewardElement) {
            rewardElement.remove();
        } else {
            console.warn(`Element reward-${rewardId} not found in the DOM`);
        }
    } catch (error) {
        console.error("Error deleting reward:", error);
    }
}



// Call the fetchRewards function when the page loads
document.addEventListener('DOMContentLoaded', fetchRewards);


