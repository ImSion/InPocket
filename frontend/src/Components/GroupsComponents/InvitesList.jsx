import React from 'react';
import { Dropdown, Button } from 'flowbite-react';

const InvitesList = ({ invites, onAccept, onReject }) => {
  return (
    <div className="mb-4">
      <Dropdown label="Inviti ai Gruppi" className='w-52' arrowIcon={false}>
        {invites.length === 0 ? (
          <Dropdown.Item>Nessun invito pendente</Dropdown.Item>
        ) : (
          invites.map(invite => (
            <Dropdown.Item key={invite._id}>
              <div className="flex flex-col">
                <p>Gruppo: {invite.group.name}</p>
                <p>Invitato da: {invite.invitedBy.nome} {invite.invitedBy.cognome}</p>
                <div className="mt-2 flex gap-2">
                  <Button 
                    size="xs"
                    color="success"
                    onClick={() => onAccept(invite._id)}
                  >
                    Accetta
                  </Button>
                  <Button 
                    size="xs"
                    color="failure"
                    onClick={() => onReject(invite._id)}
                  >
                    Rifiuta
                  </Button>
                </div>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown>
    </div>
  );
};

export default InvitesList;