import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import WorkoutTracker from './pages/WorkoutTracker';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Calendario from './pages/Calendario';
import Estadisticas from './pages/Estadisticas';
import Settings from './pages/Settings';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/workout-tracker" element={<WorkoutTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <Calendario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Estadisticas" 
          element={
            <ProtectedRoute>
              <Estadisticas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<WorkoutTracker />} />
        {/* Redirigir cualquier ruta no encontrada a workout-tracker */}
        <Route path="*" element={<Navigate to="/workout-tracker" />} />
      </Routes>
    </Router>
  );
}

export default App;
