const socket = io('http://localhost:3000'); // Connect to backend

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
