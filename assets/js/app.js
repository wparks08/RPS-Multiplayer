// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDYWHgfVhYT-1UYm4ey2XTD4C7XxjCvHMg",
    authDomain: "rps-multiplayer-fd7ea.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fd7ea.firebaseio.com",
    projectId: "rps-multiplayer-fd7ea",
    storageBucket: "rps-multiplayer-fd7ea.appspot.com",
    messagingSenderId: "1067490817062",
    appId: "1:1067490817062:web:a126e9e70b095f7668a2e7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();