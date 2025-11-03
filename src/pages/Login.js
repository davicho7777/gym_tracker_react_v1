// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import { useSettings } from "../context/SettingsContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, guestLogin } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useSettings();

  useEffect(() => {
    try {
      const remembered = localStorage.getItem("rememberedEmail");
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      // persist email if requested
      try {
        if (remember) localStorage.setItem("rememberedEmail", email);
        else localStorage.removeItem("rememberedEmail");
      } catch (err) {
        // ignore storage errors
      }
      console.log(
        "Submitting form with email:",
        email,
        "and password:",
        password
      );
      await login(email, password);
      console.log("User logged in and redirected to /workout-tracker");
      navigate("/workout-tracker");
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.code === "auth/user-not-found") {
        setError("User not found");
      } else if (error.code === "auth/wrong-password") {
        setError("Wrong password");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError("Failed to log in");
      }
    }
    setLoading(false);
  }

  async function handleGuest(e) {
    e && e.preventDefault && e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const guest = guestLogin();
      console.log("Guest logged in:", guest);
      navigate("/workout-tracker");
    } catch (err) {
      console.error("Guest login failed", err);
      setError("No se pudo iniciar sesión como invitado");
    } finally {
      setLoading(false);
    }
  }

  function toggleShow() {
    setShowPassword((prev) => !prev);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-extrabold mr-3">
              GT
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Gym Tracker 28K</h1>
              <p className="text-sm text-gray-600">
                Tu registro de entrenamientos — rápido y simple
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={theme === "default" ? "primary" : "ghost"}
                onClick={() => setTheme("default")}
              >
                Default
              </Button>
              <Button
                size="sm"
                variant={theme === "dark" ? "primary" : "ghost"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                size="sm"
                variant={theme === "tripi" ? "primary" : "ghost"}
                onClick={() => setTheme("tripi")}
              >
                Tripi
              </Button>
              <Button
                size="sm"
                variant={theme === "vivid" ? "primary" : "ghost"}
                onClick={() => setTheme("vivid")}
              >
                Vivid
              </Button>
            </div>
          </div>
          {error && (
            <div className="mb-4 text-center text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Correo
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShow}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mr-2"
                />
                Recordar correo
              </label>
              <Link to="/signup" className="text-sm text-blue-600">
                Crear cuenta
              </Link>
            </div>

            <div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Entrar"}
              </Button>
            </div>
            <div>
              <Button
                variant="neutral"
                size="md"
                className="w-full mt-2"
                type="button"
                onClick={handleGuest}
                disabled={loading}
              >
                Entrar como invitado
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link to="/signup" className="text-blue-600">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
