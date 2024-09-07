import React, { useState, useEffect, useContext } from 'react';  // Importa React e hooks necessari
import { getGroups, createGroup, getUserGroupsAndInvites, acceptGroupInvite, rejectGroupInvite, deleteGroup } from '../Modules/ApiCrud';  // Importa funzioni API
import GroupList from '../Components/GroupsComponents/GroupList';  // Importa componente per la lista dei gruppi
import GroupDetail from '../Components/GroupsComponents/GroupDetail';  // Importa componente per i dettagli del gruppo
import CreateGroupForm from '../Components/GroupsComponents/CreateGroup';  // Importa componente per creare un nuovo gruppo
import InvitesList from '../Components/GroupsComponents/InvitesList';  // Importa componente per la lista degli inviti
import { NotificationContext, NotificationProvider } from '../Contexts/NotificationContext';  // Importa contesto per le notifiche

export default function Groups({ userData }) {
  // Stati per gestire gruppi, inviti, gruppo selezionato e form di creazione
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { addNotification, showAlert } = useContext(NotificationContext);  // Usa il contesto delle notifiche

  // Effetto per caricare i gruppi e gli inviti dell'utente
  useEffect(() => {
    if (userData) {
      fetchUserGroupsAndInvites();
    }
  }, [userData]);

  // Funzione per recuperare i gruppi e gli inviti dell'utente
  const fetchUserGroupsAndInvites = async () => {
    try {
      const response = await getUserGroupsAndInvites(userData._id);
      setGroups(response.data.groups);
      setInvites(response.data.invites);
    } catch (error) {
      console.error('Errore nel recupero dei gruppi e degli inviti:', error);
    }
  };

  // Funzione per creare un nuovo gruppo
  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup({ ...groupData, creatorId: userData._id });
      fetchUserGroupsAndInvites();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Errore nella creazione del gruppo:', error);
    }
  };

  // Funzione per accettare un invito a un gruppo
  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptGroupInvite(inviteId);
      fetchUserGroupsAndInvites();
      showAlert(`Hai accettato l'invito al gruppo`);
    } catch (error) {
      console.error('Errore nell\'accettare l\'invito:', error);
      showAlert('Errore nell\'accettare l\'invito', 'error');
    }
  };

  // Funzione per eliminare un gruppo
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      await fetchUserGroupsAndInvites();
      setSelectedGroup(null);
    } catch (error) {
      console.error('Errore nell\'eliminazione del gruppo:', error);
    }
  };

  // Funzione per rifiutare un invito a un gruppo
  const handleRejectInvite = async (inviteId) => {
    try {
      await rejectGroupInvite(inviteId);
      fetchUserGroupsAndInvites();
      showAlert('Invito rifiutato');
    } catch (error) {
      console.error('Errore nel rifiutare l\'invito:', error);
      showAlert('Errore nel rifiutare l\'invito', 'error');
    }
  };

  // Rendering del componente
  return (
    <div className=" mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      <div className='flex flex-col items-center justify-center'>
        <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">I tuoi Gruppi</h1>
        {/* Pulsante per creare un nuovo gruppo */}
           <button onClick={() => setShowCreateForm(true)} className="bg-cyan-500 h-10 text-white px-4 py-2 rounded mb-4">
             Crea Nuovo Gruppo
           </button>
 
      </div>
          
      <div className='flex flex-col items-center md:flex-row justify-around w-full md:w-[800px]'>
        <div className='flex flex-col'>
          

          {/* Lista degli inviti */}
          <InvitesList 
            invites={invites}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
          />
        </div>
        
        {/* Lista dei gruppi */}
        <GroupList 
          groups={groups} 
          onSelectGroup={setSelectedGroup}
        />
      </div>
      
      {/* Form per creare un nuovo gruppo */}
      {showCreateForm && (
        <CreateGroupForm 
          onSubmit={handleCreateGroup} 
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      <div className="flex flex-col">
        <div className="w-full">
        {/* Dettagli del gruppo selezionato */}
        {selectedGroup && (
          <GroupDetail 
            group={selectedGroup} 
            onUpdate={fetchUserGroupsAndInvites}
            onDelete={handleDeleteGroup}
            userData={userData}
          />
          )}
        </div>
      </div>
    </div>
  );
}