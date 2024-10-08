import axiosApi from "./Axios";

// CRUD per gli utenti

export const getUsers = (page = 1) => axiosApi.get(`/users?page=${page}`); // Recupera tutti gli utenti con paginazione
export const getUser = (id) => axiosApi.get(`/users/${id}`); // Recupera un singolo utente tramite ID
export const getUserByAuth0Id = async (auth0Id) => { // Recupera un utente tramite Auth0ID
  try {
    const response = await axiosApi.get(`/users/auth0/${auth0Id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("Utente non trovato per Auth0Id:", auth0Id);
      return null;
    }
    throw error;
  }
};
export const getUserByEmail = async (email) => { // riceviamo un utente tramite la mail
  try {
    const response = await axiosApi.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Utente non trovato
    }
    throw error;
  }
}; 
export const createUser = async (userData) => { // creiamo un utente
  try {
    const response = await axiosApi.post("/users", userData);
    console.log("Nuovo utente creato:", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore nella creazione dell'utente:", error);
    throw error;
  }
}; 
export const updateUser = async (id, userData) => { // Aggiorna un utente esistente
  try {
    const response = await axiosApi.patch(`/users/${id}`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("Utente aggiornato:", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'utente:", error);
    throw error;
  }
};
export const updateUserAvatar = (id, avatarData) => // Aggiorna l'avatar di un utente
  axiosApi.patch(`/users/${id}/avatar`, avatarData, {
    headers: {
      "Content-Type": 'multipart/form-data'
    }
  });
export const deleteUser = (id) => axiosApi.delete(`/users/${id}`); // eliminiamo un utente

// CRUD per le transazioni

export const getTransactions = (page = 1, limit = 10) => axiosApi.get(`/transactions?page=${page}&limit=${limit}`); // GET: Recupera tutte le transazioni (con paginazione)
export const getTransaction = (id) => axiosApi.get(`/transactions/${id}`); // GET: Recupera una transazione specifica tramite ID
export const getUserTransactions = (userId) => axiosApi.get(`/transactions/user/${userId}`); // GET: Recupera tutte le transazioni di uno specifico utente
export const createTransaction = async (userId, transactionData) => { // Crea una nuova transazione
  try {
    console.log("Dati transazione da inviare:", { ...transactionData, user: userId });
    const response = await axiosApi.post("/transactions", { 
      ...transactionData,
      user: userId,
      categoria: transactionData.categoria || '',
      tipo: transactionData.tipo || 'uscita'
    });
    console.log("Risposta del server:", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore completo:", error);
    console.error("Dettagli errore:", error.response?.data);
    throw error;
  }
};
export const updateTransaction = (userId, id, transactionData) => axiosApi.patch(`/transactions/${id}`, { ...transactionData, user: userId }); // PATCH: Aggiorna parzialmente una transazione esistente
export const deleteTransaction = (userId, id) => axiosApi.delete(`/transactions/${id}`, { data: { user: userId } }); // DELETE: Elimina una transazione
export const getTotalExpenses = (userId, startDate, endDate) => // GET: Ottieni il totale delle spese per un utente in un periodo specifico
  axiosApi.get(`/transactions/total-expenses/${userId}`, {
    params: { startDate, endDate }
  });

  export const getExpensesByCategory = (userId, startDate, endDate, expandCategories) => // GET: Ottieni il totale delle spese per categoria per un utente in un periodo specifico
  axiosApi.get(`/transactions/expenses-by-category/${userId}`, {
    params: { startDate, endDate, expandCategories }
  });


  // CRUD per autenticazione 

  // Funzione per registrare un nuovo utente
  export const registerUser = async (userData) => {
    try {
      const response = await axiosApi.post("/users", userData);
      console.log("Risposta API registrazione:", response.data);
      return response.data.user || response.data;  // Gestisce entrambi i casi
    } catch (error) {
      console.error("Errore nella chiamata API di registrazione:", error.response?.data || error.message);
      throw error;
    }
  };

// Funzione per effettuare il login di un utente
export const loginUser = async (credentials) => {
      try {
        const response = await axiosApi.post("/auth", credentials);
        console.log("Risposta API login:", response.data);
        return response.data;
      } catch (error) {
        console.error("Errore nella chiamata API di login:", error);
        throw error;
      }
    };

// Funzione per ottenere i dati dell'utente attualmente autenticato
export const getMe = () =>
      axiosApi.get("/auth/me").then((response) => response.data);

// Funzione per ottenere i dati dell'utente attualmente autenticato con gestione degli errori
export const getUserData = async () => {
      try {
        const response = await axiosApi.get('/auth/me'); // Effettua la richiesta per ottenere i dati dell'utente
        return response.data; // Restituisce i dati della risposta
      } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error); // Log dell'errore per debugging
        throw error; // Lancia l'errore per essere gestito dal chiamante
      }
    };


// Funzioni per i gruppi
export const getGroups = () => axiosApi.get('/groups'); // Recupera tutti i gruppi
export const createGroup = (groupData) => axiosApi.post('/groups', groupData); // Crea un nuovo gruppo
export const getGroup = (id) => axiosApi.get(`/groups/${id}`); // Recupera un gruppo specifico
export const updateGroup = (id, groupData) => axiosApi.put(`/groups/${id}`, groupData); // Aggiorna un gruppo esistente
export const deleteGroup = (id) => axiosApi.delete(`/groups/${id}`); // Elimina un gruppo
export const inviteToGroup = async (groupId, userEmail, inviterId) => { // Invita un utente a un gruppo
  try {
    const response = await axiosApi.post(`/groups/${groupId}/invite`, { email: userEmail, inviterId });
    return response.data;
  } catch (error) {
    console.error('Errore nell\'invito dell\'utente al gruppo:', error);
    throw error;
  }
};
export const createTask = async (groupId, taskData) => { // Crea una nuova task in un gruppo
  try {
    console.log('Dati task da inviare:', taskData);
    const response = await axiosApi.post(`/groups/${groupId}/tasks`, taskData);
    console.log('Risposta del server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore dettagliato nella creazione della task:', error.response?.data || error.message);
    throw error;
  }
};
export const deleteTask = async (groupId, taskId) => { // Elimina una task da un gruppo
  try {
    const response = await axiosApi.delete(`/groups/${groupId}/tasks/${taskId}`);
    console.log('Task eliminata:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'eliminazione della task:', error);
    throw error;
  }
};
export const updateTask = (groupId, taskId, taskData) => axiosApi.put(`/groups/${groupId}/tasks/${taskId}`, taskData); // Aggiorna una task in un gruppo
export const getUserGroupsAndInvites = (userId) => axiosApi.get(`/users/${userId}/groups-and-invites`); // Recupera i gruppi e gli inviti di un utente
export const acceptGroupInvite = (inviteId) => axiosApi.post(`/groups/accept-invite/${inviteId}`); // Accetta un invito a un gruppo
export const rejectGroupInvite = (inviteId) => axiosApi.post(`/groups/reject-invite/${inviteId}`); // Rifiuta un invito a un gruppo
export const removeUserFromGroup = (groupId, creatorId, userIdToRemove) => axiosApi.post(`/groups/${groupId}/remove-user`, { creatorId, userIdToRemove }); // Rimuove un utente da un gruppo
export const leaveGroup = (groupId, userId) => axiosApi.post(`/groups/${groupId}/leave`, { userId }); // Abbandona un gruppo


// Funzione per la ricerca degli utenti
export const searchUsers = (query) => axiosApi.get(`/users/search?q=${query}`);