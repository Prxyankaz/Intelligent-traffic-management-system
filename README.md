# **Traffic Management System**

## Overview

The **Traffic Management System** is a web-based application designed to provide real-time traffic monitoring, emergency vehicle alerts, and traffic analysis using the Google Maps API. The system supports multiple user roles and integrates WebSockets for instant emergency alerts.

## Features

- **Real-time Traffic Map**: Displays live traffic conditions using Google Maps API.
- **Emergency Vehicle Alert System**: Emergency vehicle drivers can send alerts to notify users about approaching vehicles.
- **User Authentication**: Supports login/logout functionality.
- **WebSockets Integration**: Enables real-time notifications using Socket.io.
- **Responsive Design**: Works seamlessly across various devices.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Firebase Authentication (for user management)
- **WebSockets**: Socket.io for real-time communication
- **Maps API**: Google Maps API for live traffic visualization

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- Node.js & npm
- A Google Maps API Key
- A backend service running at `https://traffic-management-backend.onrender.com/`

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repository/traffic-management-system.git
   cd traffic-management-system
   ```
2. **Install dependencies (if applicable):**
   ```bash
   npm install
   ```
3. **Run the backend server:**
   ```bash
   cd backend
   node server.js
   ```
4. **Launch the frontend:**
   Simply open `index.html` in a browser.

## Google Maps Integration

Ensure your **Google Maps API Key** is fetched dynamically from the backend. The key is loaded in JavaScript as:

```js
fetch('https://traffic-management-backend.onrender.com/api/maps-key')
    .then(response => response.json())
    .then(data => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&callback=initMap&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    })
    .catch(error => console.error('Error loading API key:', error));
```

## Map Initialization

In your `initMap()` function, initialize Google Maps:

```js
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default location (Bangalore)
        zoom: 12,
    });

    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
}
```

## Troubleshooting

- **Map Not Visible?** Ensure your API key is valid and the script is loading properly.
- **CORS Issues?** Check backend API responses and allow necessary headers.
- **Socket.io Not Working?** Ensure the backend WebSocket server is running and listening for events.

## Future Improvements

- Implement user roles with different permissions.
- Add more real-time analytics for traffic data.
- Enhance UI/UX with better visuals and animations.

## Contributors

- **Harini** - Developer

## License

This project is open-source and available under the **MIT License**.

