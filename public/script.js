const socket = io('https://traffic-management-backend.onrender.com');

// Function to send user location to the backend
function sendUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("updateLocation", { lat: latitude, lng: longitude });
            console.log("📍 Location sent to server:", latitude, longitude);
        }, (error) => {
            console.error("❌ Error getting location:", error);
        });
    } else {
        console.error("❌ Geolocation is not supported by this browser.");
    }
}

// Send location when user logs in
sendUserLocation();

// Handle emergency alert button
document.getElementById("alert-btn")?.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("emergencyAlert", { location: { lat: latitude, lng: longitude } });
            alert("🚨 Emergency Alert Sent!");
        });
    } else {
        alert("❌ Location access required for emergency alerts.");
    }
});

// Receive emergency alerts
socket.on("showAlert", (data) => {
    alert(data.message);
});

// Handle real-time incident reporting
document.getElementById("report-incident-btn")?.addEventListener("click", async () => {
    const type = document.getElementById("incident-type").value;
    const description = document.getElementById("incident-description").value;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch("/reportIncident", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, description, location: { lat: latitude, lng: longitude } })
            });
            const data = await response.json();
            alert(data.message);
        });
    } else {
        alert("❌ Location access required to report incidents.");
    }
});

// Receive new incidents in real-time
socket.on("newIncident", (incident) => {
    console.log("🚧 New Incident:", incident);
    alert(`🚧 New Incident Reported: ${incident.type} - ${incident.description}`);
});

// Google Maps Initialization
window.onload = function () {
    if (typeof google !== 'undefined' && google.maps) {
        console.log("Google Maps API Loaded Successfully");
        initMap();
    } else {
        console.error("Google Maps API failed to load. Check your API key.");
    }
};

function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: latitude, lng: longitude },
            zoom: 14,
        });
        
        new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: "Your Location",
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new google.maps.Size(40, 40),
            },
        });
    });
    console.log("Map initialized successfully.");
}

// Login
document.getElementById("loginBtn")?.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid credentials");
        }
    });
});

// Register
document.getElementById("registerBtn")?.addEventListener("click", () => {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) window.location.href = "index.html";
    });
});
