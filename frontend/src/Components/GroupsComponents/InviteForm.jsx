import React, { useState } from 'react';

export default function InviteForm({ onSubmit, onCancel }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="email"
        placeholder="Email dell'utente da invitare"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mr-2"
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Invita</button>
      <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded ml-2">Annulla</button>
    </form>
  );
}