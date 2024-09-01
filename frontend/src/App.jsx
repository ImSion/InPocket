import React, { useState, useEffect } from 'react';
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
import Groups from './Pages/Groups';
import WaveBackground from './Components/WaveBackground';
import { NotificationProvider } from './Contexts/NotificationContext.jsx';
import { Flowbite } from 'flowbite-react';

function App() {
  const { isLoading } = useAuth0();
  const { userData, updateUserData } = useUserData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Flowbite>
      <div className="relative min-h-screen">
        <WaveBackground />
        <div className="relative z-10">
          <NotificationProvider>
            <Router>
              <Nav 
                userData={userData} 
              />
              <main className="px-2 sm:px-5 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<AuthWrapper />}>
                    <Route path="/" element={<Home userData={userData} />} />
                    <Route path="home" element={<Home userData={userData} />} />
                    <Route path="profile" element={<UserProfile userData={userData} updateUserData={updateUserData} />} />
                    <Route path="/groups" element={<Groups userData={userData} />} />
                    <Route path="register" element={<Register userData={userData} updateUserData={updateUserData} />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </main>
              <MyFooter />
            </Router>
          </NotificationProvider>
        </div>
      </div>
    </Flowbite>
  );
}

export default App;