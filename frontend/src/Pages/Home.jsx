import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Home() {
  const { userData } = useOutletContext();

  return (
    <div className='min-h-screen'>
      <h1>Welcome to InPocket</h1>
      {userData ? (
        <p>Hello, {userData.nome}! You're logged in.</p>
      ) : (
        <p>Please login or register to access all features.</p>
      )}
    </div>
  );
}