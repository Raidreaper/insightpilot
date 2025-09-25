// Firebase config provided from Firebase Console (Web App)
const firebaseConfig = {
  apiKey: "AIzaSyDug8oMS3plTt1i9k9dfK4OnrHNbmEFzPs",
  authDomain: "insightpilot-37ed9.firebaseapp.com",
  projectId: "insightpilot-37ed9",
  storageBucket: "insightpilot-37ed9.firebasestorage.app",
  messagingSenderId: "945578886898",
  appId: "1:945578886898:web:be8a8d7bf3a00edb04326b",
  measurementId: "G-6WTLCQK9BK"
};

// Initialize only if config is present (Compat SDK)
try {
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig && firebaseConfig.projectId) {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    if (firebaseConfig.measurementId && firebase.analytics) {
      try { firebase.analytics(); } catch (e) { console.warn('Analytics init failed:', e); }
    }
  } else {
    console.warn('Firebase config not found. Create firebase-config.js with your firebaseConfig.');
  }
} catch (e) {
  console.error('Firebase initialization failed:', e);
}


