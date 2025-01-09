import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDvgtsZmAHxb4tkczUNXroPEjwU0Hp2zIM",
    authDomain: "react-native-project-6bbff.firebaseapp.com",
    projectId: "react-native-project-6bbff",
    storageBucket: "react-native-project-6bbff.firebasestorage.app",
    messagingSenderId: "184549470289",
    appId: "1:184549470289:web:6279893bd1ec14142b0870"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
