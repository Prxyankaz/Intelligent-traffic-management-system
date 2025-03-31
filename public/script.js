const socket = io('https://traffic-management-backend.onrender.com');

// Function to get user role from localStorage
function getUserRole() {
    return localStorage.getItem("role"); // Ensure this is stored during login
}

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
});

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

// Handle emergency alert button (Only for emergency vehicle drivers)
const alertBtn = document.getElementById("alert-btn");
if (alertBtn) {
    alertBtn.style.display = getUserRole() === "driver" ? "block" : "none"; // Hide for normal users

    alertBtn.addEventListener("click", () => {
        if (getUserRole() !== "driver") {
            alert("❌ Only emergency vehicle drivers can send alerts.");
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                if (latitude === undefined || longitude === undefined) {
                    alert("❌ Location coordinates unavailable.");
                    return;
                }
                socket.emit("emergencyAlert", { lat: latitude, lng: longitude }); // ✅ FIXED
                alert("🚨 Emergency Alert Sent!");
            });
        } else {
            alert("❌ Location access required for emergency alerts.");
        }
    });
}

// Receive emergency alerts
socket.on("showAlert", (data) => {
    alert(`🚨 Emergency Alert: Emergency vehicle nearby at (${data.lat}, ${data.lng})`);
});

// Handle real-time incident reporting
document.getElementById("report-incident-btn")?.addEventListener("click", async () => {
    const type = document.getElementById("incident-type").value;
    const description = document.getElementById("incident-description").value;

    if (!type || !description) {
        alert("❌ Please provide both an incident type and description.");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch("/api/reportIncident", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type, description, location: { lat: latitude, lng: longitude } })
                });

                const data = await response.json();
                alert(data.message);
            } catch (error) {
                console.error("❌ Error reporting incident:", error);
                alert("❌ Failed to report incident. Please try again.");
            }
        });
    } else {
        alert("❌ Location access required to report incidents.");
    }
});

// Receive new incidents in real-time
socket.on("newIncident", (incident) => {
    alert(`🚧 New Incident Reported: ${incident.type} - ${incident.description} at (${incident.location.lat}, ${incident.location.lng})`);
});

// Google Maps Initialization
window.onload = function () {
    if (typeof google !== 'undefined' && google.maps) {
        console.log("Google Maps API Loaded Successfully");
        initMap();
    } else {
        console.error("❌ Google Maps API failed to load. Check your API key.");
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
}

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === "driver") {
                window.location.href = "traffic.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            alert("Invalid credentials");
        }
    } catch (error) {
        console.error("❌ Error logging in:", error);
        alert("❌ Login failed. Please try again.");
    }
});

// Register
document.getElementById("registerBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    try {
        const res = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();
        alert(data.message);
        if (data.success) {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("❌ Error registering:", error);
        alert("❌ Registration failed. Please try again.");
    }
});
