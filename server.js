const socket = io('https://traffic-management-backend.onrender.com');

// ✅ Function to Get User Role
function getUserRole() {
    return localStorage.getItem("role");
}

// ✅ Logout Functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
});

// ✅ Send User Location to Server
function sendUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("updateLocation", { lat: latitude, lng: longitude });
            console.log("📍 Location sent:", latitude, longitude);
        }, (error) => {
            console.error("❌ Error getting location:", error);
        });
    } else {
        console.error("❌ Geolocation not supported.");
    }
}
sendUserLocation();

// ✅ Emergency Alert for Drivers
const alertBtn = document.getElementById("alert-btn");
if (alertBtn) {
    alertBtn.style.display = getUserRole() === "driver" ? "block" : "none";
    alertBtn.addEventListener("click", () => {
        if (getUserRole() !== "driver") {
            alert("❌ Only drivers can send alerts.");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("emergencyAlert", { location: { lat: latitude, lng: longitude } });
            alert("🚨 Emergency Alert Sent!");
        });
    });
}

// ✅ Real-Time Emergency Alerts
socket.on("showAlert", (data) => {
    alert(`🚨 Emergency Alert: Vehicle nearby at (${data.location.lat}, ${data.location.lng})`);
});

// ✅ Incident Reporting
document.getElementById("report-incident-btn")?.addEventListener("click", async () => {
    const type = document.getElementById("incident-type").value;
    const description = document.getElementById("incident-description").value;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch("/reportIncident", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type, description, location: { lat: latitude, lng: longitude } })
                });

                const data = await response.json();
                alert(data.message);
            } catch (error) {
                console.error("❌ Error:", error);
            }
        });
    } else {
        alert("❌ Location required.");
    }
});

// ✅ Google Maps Initialization
window.onload = function () {
    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        console.error("❌ Google Maps API failed.");
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
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new google.maps.Size(40, 40),
            },
        });
    });
}
