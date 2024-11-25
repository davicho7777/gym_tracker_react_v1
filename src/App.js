// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WorkoutTracker from './pages/WorkoutTracker';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/workout-tracker" element={<WorkoutTracker />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;