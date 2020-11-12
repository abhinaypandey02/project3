import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
var firebaseConfig = {
  apiKey: "AIzaSyA6oAe0rOcK123FpMB8VFwJZ7IYjYHa050",
  authDomain: "project2-caa66.firebaseapp.com",
  databaseURL: "https://project2-caa66.firebaseio.com",
  projectId: "project2-caa66",
  storageBucket: "project2-caa66.appspot.com",
  messagingSenderId: "160603073424",
  appId: "1:160603073424:web:0467ce5bcbe9eb9aa9a115",
  measurementId: "G-8B370MRWDK",
};
var fire = firebase.initializeApp(firebaseConfig);
export default fire;
