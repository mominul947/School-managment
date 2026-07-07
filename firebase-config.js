/* ============================================================
   Shared Firebase configuration
   Same project used by the Admin Panel — DO NOT create a new
   Firebase project, this must stay identical everywhere.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyBHYYbAxbQVv9nL1r6b_anOa52r7_rOzEk",
  authDomain: "school-mangament.firebaseapp.com",
  projectId: "school-mangament",
  storageBucket: "school-mangament.firebasestorage.app",
  messagingSenderId: "593087054757",
  appId: "1:593087054757:web:a946aa37387c2a91a11e4c",
  measurementId: "G-PFV5MWK503"
};

if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
