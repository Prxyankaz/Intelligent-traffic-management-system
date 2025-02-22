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
function initMap() {
    var location = { lat: 12.9716, lng: 77.5946 }; // Default: Bangalore (Change if needed)
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: location
    });
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDZhTQHy-pI2-8FkewsgkNYPkXKIU5jY00",
    authDomain: "trafficmanagementsystem-dfb3e.firebaseapp.com",
    projectId: "trafficmanagementsystem-dfb3e",
    storageBucket: "trafficmanagementsystem-dfb3e.firebasestorage.app",
    messagingSenderId: "1095767209218",
    appId: "1:1095767209218:web:7dbbec59d2318537f2be1b"
  };
  

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
