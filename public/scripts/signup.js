// Function to generate a random CAPTCHA code
function generateCaptcha() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captchaCode = "";
  for (let i = 0; i < 6; i++) {
      const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
      captchaCode += randomChar;
  }
  document.getElementById("captchaCode").textContent = captchaCode;
  return captchaCode; // Return the generated CAPTCHA code for comparison
}

// Store the generated CAPTCHA code
const generatedCaptcha = generateCaptcha();

// Function to validate the form
function validateForm() {
  let fullName = document.getElementById("fullName").value;
  let nric = document.getElementById("nric").value;
  let dob = document.getElementById("dob").value;
  let pin = document.getElementById("pin").value;
  // let confirmPin = document.getElementById("confirmPin").value;
  let captcha = document.getElementById("captcha").value;
  let errorMessage = "";

  // Check if any field is empty
  if (fullName === "") {
      errorMessage += "Full Name is required.\n";
  }
  if (nric === "") {
      errorMessage += "NRIC is required.\n";
  }
  if (dob === "") {
      errorMessage += "Date of Birth is required.\n";
  }
  if (pin === "") {
      errorMessage += "PIN is required.\n";
  }
  // if (confirmPin === "") {
  //     errorMessage += "Confirm PIN is required.\n";
  // }
  if (captcha === "") {
      errorMessage += "CAPTCHA is required.\n";
  }

  // Validate CAPTCHA input
  if (captcha !== generatedCaptcha) {
      errorMessage += "Incorrect CAPTCHA. Please try again.\n";
  }

  // If there are errors, alert the user and prevent form submission
  if (errorMessage !== "") {
      alert(errorMessage);
      return false; // Prevent form submission
  }

  // If no errors, allow form submission
  return true;
}