import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className='min-h-screen'>
      <h1>Welcome to InPocket</h1>
      {isAuthenticated ? (
        <p>Hello, {user.name}! You're logged in.</p>
      ) : (
        <p>Please login or register to access all features.</p>
      )}
      {/* Aggiungi qui il contenuto principale della tua home page */}
    </div>
  );
}