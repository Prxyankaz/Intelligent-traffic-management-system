const socket = io('https://traffic-management-backend.onrender.com');
// Connect to backend

// Emergency alert button
document.getElementById("alert-btn").addEventListener("click", () => {
   socket.emit('emergencyAlert', { vehicle: "Ambulance", location: "XYZ Street" });
});

// Receive alert and show popup
socket.on('showAlert', (data) => {
   alert(data.message); // Shows alert to all logged-in users
});
window.onload = function () {
   if (typeof google !== 'undefined' && google.maps) {
       console.log("Google Maps API Loaded Successfully");
       initMap();
   } else {
       console.error("Google Maps API failed to load. Check your API key.");
   }
};

function initMap() {
   const map = new google.maps.Map(document.getElementById("map"), {
       center: { lat: 12.9716, lng: 77.5946 }, // Default location (Bangalore)
       zoom: 12,
   });

   console.log("Map initialized successfully.");
}



// Login
document.getElementById("loginBtn").addEventListener("click", () => {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;

   auth.signInWithEmailAndPassword(email, password)
       .then((userCredential) => {
           alert("Login successful!");
           window.location.href = "index.html"; // Redirect to main page
       })
       .catch((error) => {
           alert("Error: " + error.message);
       });
});

// Register
document.getElementById("registerBtn").addEventListener("click", () => {
   const email = document.getElementById("register-email").value;
   const password = document.getElementById("register-password").value;
   const userType = document.getElementById("user-type").value;

   auth.createUserWithEmailAndPassword(email, password)
       .then(async (userCredential) => {
           await db.collection("users").doc(userCredential.user.uid).set({
               email: email,
               userType: userType
           });
           alert("Registration successful! Please log in.");
           document.getElementById("register-container").style.display = "none";
           document.getElementById("login-container").style.display = "block";
       })
       .catch((error) => {
           alert("Error: " + error.message);
       });
});

// Toggle Login/Register Forms
document.getElementById("showRegister").addEventListener("click", () => {
   document.getElementById("login-container").style.display = "none";
   document.getElementById("register-container").style.display = "block";
});

document.getElementById("showLogin").addEventListener("click", () => {
   document.getElementById("register-container").style.display = "none";
   document.getElementById("login-container").style.display = "block";
});
