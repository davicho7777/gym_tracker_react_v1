// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      console.log("Attempting to sign up with email:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed up successfully:", userCredential.user);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      console.log("Attempting to log in with email:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User logged in successfully:", userCredential.user);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      // if this is a guest session, remove guest marker and clear state
      if (currentUser && currentUser.isGuest) {
        localStorage.removeItem("guestUser");
        console.log("Guest session ended");
        setCurrentUser(null);
        return;
      }

      // otherwise sign out from firebase
      await signOut(auth);
      console.log("User signed out");
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Create a guest session persisted in localStorage
  function guestLogin() {
    const guest = {
      uid: `guest-${Date.now()}`,
      displayName: "Invitado",
      isGuest: true,
    };
    try {
      localStorage.setItem("guestUser", JSON.stringify(guest));
      setCurrentUser(guest);
      return guest;
    } catch (e) {
      console.error("Failed to create guest session", e);
      throw e;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        setCurrentUser(user);
        setLoading(false);
        return;
      }

      // if there's no firebase user, check if a guest session exists in localStorage
      try {
        const guestRaw = localStorage.getItem("guestUser");
        if (guestRaw) {
          const guestObj = JSON.parse(guestRaw);
          setCurrentUser(guestObj);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    guestLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
