import React, { useState, useEffect, useContext } from 'react';
import { getGroups, createGroup, getUserGroupsAndInvites, acceptGroupInvite, rejectGroupInvite, deleteGroup } from '../Modules/ApiCrud';
import GroupList from '../Components/GroupsComponents/GroupList';
import GroupDetail from '../Components/GroupsComponents/GroupDetail';
import CreateGroupForm from '../Components/GroupsComponents/CreateGroup';
import InvitesList from '../Components/GroupsComponents/InvitesList';
import { NotificationContext, NotificationProvider } from '../Contexts/NotificationContext';

export default function Groups({ userData }) {
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { addNotification, showAlert } = useContext(NotificationContext);

  useEffect(() => {
    if (userData) {
      fetchUserGroupsAndInvites();
    }
  }, [userData]);


  const fetchUserGroupsAndInvites = async () => {
    try {
      const response = await getUserGroupsAndInvites(userData._id);
      setGroups(response.data.groups);
      setInvites(response.data.invites);
    } catch (error) {
      console.error('Errore nel recupero dei gruppi e degli inviti:', error);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup({ ...groupData, creatorId: userData._id });
      fetchUserGroupsAndInvites();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Errore nella creazione del gruppo:', error);
    }
  };

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

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      await fetchUserGroupsAndInvites();
      setSelectedGroup(null);
    } catch (error) {
      console.error('Errore nell\'eliminazione del gruppo:', error);
    }
  };

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

  return (
    <div className=" mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">I tuoi Gruppi</h1>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <button onClick={() => setShowCreateForm(true)} className="bg-cyan-500 h-10 text-white px-4 py-2 rounded mb-4">
            Crea Nuovo Gruppo
          </button>

          <InvitesList 
            invites={invites}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
          />
        </div>
        
        
        <GroupList 
          groups={groups} 
          onSelectGroup={setSelectedGroup}
        />


      </div>
      
      {showCreateForm && (
        <CreateGroupForm 
          onSubmit={handleCreateGroup} 
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      <div className="flex flex-col">
        <div className="w-full">
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