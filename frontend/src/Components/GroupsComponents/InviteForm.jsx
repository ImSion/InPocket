import React, { useState, useEffect } from 'react';
import { searchUsers, inviteToGroup } from '../../Modules/ApiCrud';
import { TextInput, Button } from 'flowbite-react';

export default function InviteForm({ groupId, onSubmit, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery).then(response => {
          setSearchResults(response.data);
        });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleInvite = async () => {
    if (selectedUser) {
      try {
        await onSubmit(selectedUser);  // Passa l'intero oggetto selectedUser
      } catch (error) {
        console.error('Errore nell\'invito dell\'utente:', error);
      }
    }
  };

  return (
    <div>
      <TextInput
        type="text"
        placeholder="Cerca utente per nome, cognome o email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ul className="mt-2">
        {searchResults.map(user => (
          <li 
            key={user._id} 
            className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedUser?._id === user._id ? 'bg-blue-100' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.nome} {user.cognome} ({user.email})
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Button onClick={handleInvite} disabled={!selectedUser}>
          Invita
        </Button>
        <Button onClick={onCancel} color="gray" className="ml-2">
          Annulla
        </Button>
      </div>
    </div>
  );
}