import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './auth';
import DriveApp from './driveapp';// Code Drive cũ của bạn

export default function App() {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/" 
          element={isAuthenticated ? <DriveApp /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}