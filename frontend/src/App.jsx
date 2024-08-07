import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserData } from './Hooks/useUserData';
import Nav from "./Components/Nav";
import MyFooter from "./Components/MyFooter";
import AuthWrapper from "./Components/AuthWrapper";
import UserProfile from './Pages/UserProfile';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';

function App() {
  const { isLoading } = useAuth0();
  const { userData, updateUserData } = useUserData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Nav userData={userData} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthWrapper />}>
          <Route path="/" element={<Home userData={userData} />} />
          <Route path="home" element={<Home userData={userData} />} />
          <Route path="profile" element={<UserProfile userData={userData} updateUserData={updateUserData} />} />
          <Route path="register" element={<Register userData={userData} updateUserData={updateUserData} />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <MyFooter />
    </Router>
  );
}

export default App;