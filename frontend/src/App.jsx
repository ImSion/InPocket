import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from './Pages/Login';
import Register from './Pages/Register'
import Home from './Pages/Home'
import UserProfile from './Pages/UserProfile'
import Nav from "./Components/Nav";
import MyFooter  from "./Components/MyFooter";
import { useAuth0 } from "@auth0/auth0-react";
import { registerUser } from "./Modules/ApiCrud";

function App() {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Tentativo di login automatico");
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Utente autenticato, dati ricevuti:", user);
      registerUser({
        auth0Id: user.sub,
        email: user.email || `${user.sub}@example.com`,  // Usa un'email di fallback se non fornita
        nome: user.given_name || user.name || user.nickname,
        cognome: user.family_name || '',
        avatar: user.picture,
        provider: user.sub.split('|')[0]
      }).then(result => {
        if (result) {
          console.log("Utente registrato/aggiornato con successo:", result);
        } else {
          console.log("Errore durante la registrazione/aggiornamento dell'utente");
        }
      });
    }
  }, [isAuthenticated, user]);


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