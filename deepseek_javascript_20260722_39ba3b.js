// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyBXs5K-6pdWxFQ8l-WtjS3pqH8v6ocXZMM",
    authDomain: "create-project-62743.firebaseapp.com",
    databaseURL: "https://create-project-62743-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "create-project-62743",
    storageBucket: "create-project-62743.firebasestorage.app",
    messagingSenderId: "923135050962",
    appId: "1:923135050962:web:03a91ebd311ee052f1d90b",
    measurementId: "G-16C3SYFNJY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Export for use in other files
window.db = db;
window.auth = auth;