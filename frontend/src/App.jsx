import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Components/Nav";
import MyFooter from "./Components/MyFooter";
import AuthWrapper from "./Components/AuthWrapper";
import UserProfile from './Pages/UserProfile';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthWrapper />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
      <MyFooter />
    </Router>
  );
}


export default App;