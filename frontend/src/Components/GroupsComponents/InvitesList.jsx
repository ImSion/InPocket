import React from 'react';

const InvitesList = ({ invites, onAccept, onReject }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Inviti ai Gruppi</h2>
      {invites.length === 0 ? (
        <p>Nessun invito pendente.</p>
      ) : (
        <ul>
          {invites.map(invite => (
            <li key={invite._id} className="mb-2 p-2 border rounded">
              <p>Gruppo: {invite.group.name}</p>
              <p>Invitato da: {invite.invitedBy.nome} {invite.invitedBy.cognome}</p>
              <div className="mt-2">
                <button 
                  onClick={() => onAccept(invite._id)} 
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  Accetta
                </button>
                <button 
                  onClick={() => onReject(invite._id)} 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Rifiuta
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvitesList;