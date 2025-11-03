// src/pages/Signup.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signup(email, password);
      navigate("/workout-tracker");
    } catch (error) {
      console.error("Error signing up:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else {
        setError("Failed to sign up");
      }
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-8">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Correo{" "}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 placeholder-gray-400"
              placeholder="Correo"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Contraseña{" "}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 placeholder-gray-400"
              placeholder="Mínimo 6 digitos"
              required
            />
          </div>
          <div className="pt-8">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p>
            Ya tienes cuenta?? 👋
            <Link to="/login" className="text-blue-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
