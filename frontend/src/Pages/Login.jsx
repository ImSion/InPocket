import LoginButton from "../Components/LoginButton";
import LogoutButton from "../Components/LogoutButton";
import React from 'react'

export default function Login() {
  return (
    <>
      <div className="flex flex-col min-h-screen items-center mt-10">
        <h1 className="text-xl font-bold">Auth0 Login</h1>
        <div>
            <LoginButton />
            <LogoutButton />
        </div>
        
      </div>
    </>
  )
}

