import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from './Pages/Login';
import Register from './Pages/Register'
import Home from './Pages/Home'
import UserProfile from './Pages/UserProfile'
import Nav from "./Components/Nav";
import MyFooter  from "./Components/MyFooter";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect } = useAuth0();

  console.log("isLoading:", isLoading);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("error:", error);
  console.log("user:", user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Tentativo di login automatico");
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
     <Router>
      <Nav/>
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace/>}/>
        <Route path='/login' element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
      </Routes>
      <MyFooter/>
     </Router>
  )
}

export default App