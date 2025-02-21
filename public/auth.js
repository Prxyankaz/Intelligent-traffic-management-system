// Initialize Firebase using environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 📌 SIGNUP FUNCTION
async function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // "user" or "emergency"

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        // Store user details in Firestore
        await db.collection("users").doc(userId).set({
            email: email,
            role: role
        });

        alert("Signup successful! Redirecting...");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Signup error:", error.message);
    }
}

// 📌 LOGIN FUNCTION
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        // Get user role
        const userDoc = await db.collection("users").doc(userId).get();
        const role = userDoc.data().role;

        // Redirect based on role
        if (role === "emergency") {
            window.location.href = "emergency-dashboard.html";
        } else {
            window.location.href = "user-dashboard.html";
        }
    } catch (error) {
        console.error("Login error:", error.message);
    }
}

// 📌 SAVE USER DATA FUNCTION
async function saveUserData(userId, role) {
    await db.collection("users").doc(userId).set({ role });
}

// 📌 RETRIEVE USER DATA FUNCTION
async function getUserData(userId) {
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists()) {
        return userDoc.data();
    } else {
        console.log("User not found");
        return null;
    }
}
