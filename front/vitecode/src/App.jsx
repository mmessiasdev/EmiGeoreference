import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MapComponent from './components/maps';
import Login from './view/auth/login';
import Register from './view/auth/register';
import ProtectedRoute from './routes/protectedroutes';

function App() {
  return (
    <Router> {/* Envolva tudo com o Router */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <MapComponent />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;