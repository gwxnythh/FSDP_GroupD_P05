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
  
  async function signUp() {
      if (!validateForm()) {
          return;
      }
  
      let fullname = document.getElementById("fullName").value;
      let nric = document.getElementById("nric").value;
      let email = document.getElementById("email").value;
      let mobileNumber = document.getElementById("mobileNumber").value;
      let pin = document.getElementById("pin").value;
      let hapticTouch = document.getElementById("hapticTouch").value;
      let voiceOver = document.getElementById("voiceOver").value;
      let voiceRecognition = document.getElementById("voiceRecognition").value;
  
      const response = await fetch("/signup", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              fullname,
              nric,
              email,
              mobileNumber,
              pin,
              isHapticTouch: hapticTouch,
              isVoiceOver: voiceOver,
              isVoiceRecognition: voiceRecognition
          })
      });
      const data = await response.json();
      if (response.ok) {
          sessionStorage.setItem('accessCode', data.accessCode); // Store access code in sessionStorage
          sessionStorage.setItem('userName', data.fullname); // Store the user's full name in sessionStorage
          saveAccessibilityMode();
          const isVoiceEnabled = (localStorage.getItem("voiceOver") === "true");
          if (isVoiceEnabled) {
              // Trigger voice output with user's full name
              speak(`Welcome ${data.user}`);
          }
          // Redirect to index.html on successful login
          window.location.href = 'index.html';
      } else {
          alert(data.message); // Display error message if login fails
          throw new Error('Failed to sign up');
      }
  
      console.log('response', JSON.stringify(response))
  }
  
  // Function to validate the form
  function validateForm() {
    let fullName = document.getElementById("fullName").value;
    let nric = document.getElementById("nric").value;
    let dob = document.getElementById("dob").value;
    let pin = document.getElementById("pin").value;
    let mobileNumber = document.getElementById("mobileNumber").value;
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
    if (mobileNumber.length !== 8) {
      errorMessage += "Mobile number must be 8 digits.\n";
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
  
    return true;
  }
  
  function saveAccessibilityMode() {
      let hapticTouch = document.getElementById("hapticTouch").checked;
      if (hapticTouch) {
          localStorage.setItem("hapticTouch", true);
      } else {
          localStorage.setItem("hapticTouch", false);
      }
      let voiceOver = document.getElementById("voiceOver").checked;
      if (voiceOver) {
          localStorage.setItem("voiceOver", true);
      } else {
          localStorage.setItem("voiceOver", false);
      }
      let voiceRecognition = document.getElementById("voiceRecognition").checked;
      if (voiceRecognition) {
          localStorage.setItem("voiceRecognition", true);
      } else {
          localStorage.setItem("voiceRecognition", false);
      }
  }