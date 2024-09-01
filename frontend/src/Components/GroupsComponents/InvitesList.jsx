import React from 'react';

const InvitesList = ({ invites, onAccept, onReject }) => {

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptGroupInvite(inviteId);
      // Aggiorna lo stato o ricarica gli inviti
      // Potresti voler chiamare una funzione per aggiornare la lista degli inviti
      alert('Invito accettato con successo');
    } catch (error) {
      console.error('Errore nell\'accettazione dell\'invito:', error);
      alert('Errore nell\'accettazione dell\'invito: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2 dark:text-white">Inviti ai Gruppi</h2>
      {invites.length === 0 ? (
        <p className='dark:text-white'>Nessun invito pendente.</p>
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