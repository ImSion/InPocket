import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "flowbite-react";
import logo from '../assets/Logo.png';

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleRegister = () => {
    window.location.href = "https://dev-obl7w1lr6ozyat2c.us.auth0.com/u/signup?state=hKFo2SB2Q1ZmMmRxUEFHSXlJenNNaVR3dUFSZFVRdm1CeFNTYqFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIFJjMVp5X0JnbGJxQWVkcGZCU3RsWEhxMWZ6ZHY2M2FXo2NpZNkgTUxySTBabEtHdWY0ZDBxcjNJMUVNYk04THB2NmprdUw";
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center dark:text-white">
      <h1 className="text-3xl mb-10 font-bold">Benvenuto in</h1>

      <div className="flex mb-10">
        <span className="self-center whitespace-nowrap text-4xl font-semibold dark:text-white">In</span>
        <img src={logo} className="h-10 sm:h-40" alt="Logo InPocket" />
        <span className="self-center whitespace-nowrap text-4xl font-semibold dark:text-white">ocket</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button size="lg" onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
          Login
        </Button>
        <Button size="lg" onClick={handleRegister} className="bg-green-600 hover:bg-green-700">
          Registrati
        </Button>
      </div>
    </div>
  );
}