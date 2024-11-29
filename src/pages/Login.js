// src/pages/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      console.log("Submitting form with email:", email, "and password:", password);
      await login(email, password);
      console.log("User logged in and redirected to /workout-tracker");
      navigate('/workout-tracker');
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found') {
        setError('User not found');
      } else if (error.code === 'auth/wrong-password') {
        setError('Wrong password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to log in');
      }
    }
    setLoading(false);
  }

  return (
    // Agregamos min-h-screen para asegurar que el contenedor tome toda la altura de la pantalla
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-8"> {/* Contenedor con espacio vertical */}
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Aumentamos el espacio entre elementos del formulario */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Correo  </label>
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
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Contraseña  </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 placeholder-gray-400"
              placeholder="Mínimo 6 dígitos"
              required
            />
          </div>
          {/* Agregamos más espacio antes del botón */}
          <div className="pt-8"> {/* Padding top para separar el botón */}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center"> {/* Aumentamos el margen superior */}
          <p>
            No tienes cuenta? <Link to="/signup" className="text-blue-500">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
