import React, { useState, useEffect } from 'react';
import { getGroups, createGroup, getUserGroupsAndInvites, acceptGroupInvite, rejectGroupInvite } from '../Modules/ApiCrud';
import GroupList from '../Components/GroupsComponents/GroupList';
import GroupDetail from '../Components/GroupsComponents/GroupDetail';
import CreateGroupForm from '../Components/GroupsComponents/CreateGroup';
import InvitesList from '../Components/GroupsComponents/InvitesList';

export default function Groups({ userData }) {
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
    } catch (error) {
      console.error('Errore nell\'accettare l\'invito:', error);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await rejectGroupInvite(inviteId);
      fetchUserGroupsAndInvites();
    } catch (error) {
      console.error('Errore nel rifiutare l\'invito:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">I tuoi Gruppi</h1>
      <button 
        onClick={() => setShowCreateForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Crea Nuovo Gruppo
      </button>
      {showCreateForm && (
        <CreateGroupForm 
          onSubmit={handleCreateGroup} 
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
          <GroupList 
            groups={groups} 
            onSelectGroup={setSelectedGroup}
          />
          <InvitesList 
            invites={invites}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
          />
        </div>
        <div className="w-full md:w-2/3">
          {selectedGroup && (
            <GroupDetail 
              group={selectedGroup} 
              onUpdate={fetchUserGroupsAndInvites}
              userData={userData}
            />
          )}
        </div>
      </div>
    </div>
  );
}