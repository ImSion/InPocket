```
InPocket/
│
├── backend/
│   ├── config/
│   │   └── cloudinaryConfig.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorsHandler.js
│   ├── models/
│   │   ├── Groups.js
│   │   ├── Notification.js
│   │   ├── Transactions.js
│   │   └── Users.js
│   ├── routes/
│   │   ├── groupsRoutes.js
│   │   ├── transactionsRoutes.js
│   │   └── usersRoutes.js
│   ├── utils/
│   │   └── jwt.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AuthWrapper.jsx
    │   │   ├── Calendar.jsx
    │   │   ├── MyFooter.jsx
    │   │   ├── Nav.jsx
    │   │   ├── Notifications.jsx
    │   │   └── Transactions.jsx
    │   │   
    │   │   
    │   ├── Contexts/
    │   │   └── NotificationContext.jsx
    │   ├── Hooks/
    │   │   └── useUserData.js
    │   ├── Modules/
    │   │   ├── ApiCrud.js
    │   │   └── Axios.js
    │   ├── Pages/
    │   │   ├── Groups.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── UserProfile.jsx
    │   ├── Style/
    │   │   └── MainCSS.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
    ```


    # InPocket

InPocket è un'applicazione di gestione finanziaria personale che permette agli utenti di tracciare entrate e uscite,    visualizzare statistiche e gestire budget di gruppo.

## Architettura del Progetto

        ```
         +-------------+
         |   Cliente   |
         +-------------+
                |
                | HTTPS
                |
         +-------------+
         |  Frontend   |
         |   (React)   |
         +-------------+
                |
                | API Calls
                |
         +-------------+
         |  Backend    |
         | (Node.js/   |
         |  Express)   |
         +-------------+
                |
                | Queries
                |
         +-------------+
         |  Database   |
         | (MongoDB)   |
         +-------------+
                |
         +-------------+
         |   Servizi   |
         |   Esterni   |
         +-------------+
         | - Auth0     |
         | - Cloudinary|
         +-------------+
         ```
         
    ## Componenti Principali

### Frontend (React)

- **Tecnologie e librerie principali:
  - React: per la costruzione dell'interfaccia utente
  - React Router: per la gestione della navigazione
  - Auth0: per l'autenticazione degli utenti
  - Axios: per le chiamate API
  - Recharts: per la visualizzazione dei grafici
  - react-big-calendar: per il componente calendario
  - Flowbite React: per componenti UI predefiniti
  - Tailwind CSS: per lo styling

- **Punti focali:
*Gestione dello stato:
  - Utilizzo di React Hooks (useState, useEffect, useContext) per la gestione dello stato e degli effetti collaterali
  - Context API per la gestione dello stato globale (es. NotificationContext)

*Autenticazione:
  - Integrazione con Auth0 per una gestione sicura dell'autenticazione
  - Utilizzo di AuthWrapper per proteggere le route autenticate

*Visualizzazione dati:
  - Utilizzo di Recharts per creare grafici interattivi (es. andamento entrate/uscite, spese per categoria)
  - Implementazione di un calendario personalizzato con react-big-calendar

*Gestione tema chiaro/scuro:
  - Implementazione di un toggle per il cambio tema utilizzando Tailwind CSS e Flowbite

*Comunicazione con il backend:
  - Utilizzo di Axios per effettuare chiamate API RESTful al backend
  - Implementazione di funzioni CRUD in ApiCrud.js per interagire con il backend

- **Pagine Principali**:
  - Home: Dashboard con grafici e statistiche finanziarie
  - Groups: Gestione dei gruppi finanziari
  - UserProfile: Profilo utente e impostazioni
  - Login/Register: Autenticazione utente

- **Componenti Chiave**:
  - Nav: Barra di navigazione responsiva
  - Transactions: Form per aggiungere/modificare transazioni
  - PieExpensesGraphic: Grafico a torta per visualizzare spese

- **Funzionalità**:
  - Autenticazione (tramite Auth0)
  - CRUD operazioni per transazioni e gruppi
  - Visualizzazione di grafici e statistiche
  - Toggle tema chiaro/scuro

### Backend (Node.js/Express)

- **Tecnologie principali:
  - Express.js: framework web per Node.js
  - Mongoose: ODM per MongoDB
  - JSON Web Tokens (JWT): per l'autenticazione
  - Cloudinary: per la gestione delle immagini di profilo
  - Cors: per la gestione delle richieste cross-origin

- **API Routes**:
  - `/users`: Gestione degli utenti
  - `/transactions`: CRUD operazioni per le transazioni
  - `/groups`: Gestione dei gruppi finanziari

- **Middleware**:
  - `authMiddleware`: Verifica dei token JWT
  - `errorsHandler`: Gestione centralizzata degli errori

- **Servizi**:
  - `cloudinaryConfig`: Configurazione per l'upload di immagini

### Database (MongoDB)

- **Collections**:
  - Users: Informazioni sugli utenti
  - Transactions: Dettagli delle transazioni finanziarie
  - Groups: Informazioni sui gruppi finanziari

### Servizi Esterni

- **Auth0**: Autenticazione e gestione degli utenti
- **Cloudinary**: Gestione e ottimizzazione delle immagini di profilo

## Flusso di Lavoro Tipico

1. L'utente accede all'applicazione e si autentica tramite Auth0.
2. Nella dashboard, l'utente può visualizzare statistiche e grafici delle proprie finanze.
3. L'utente può aggiungere nuove transazioni o modificare quelle esistenti.
4. Le richieste vengono inviate al backend Node.js che le elabora e aggiorna il database.
5. L'utente può creare o unirsi a gruppi per gestire finanze condivise.
6. Le immagini di profilo vengono caricate e gestite tramite Cloudinary.

## Caratteristiche Principali

- **Gestione Finanziaria Personale**: Tracciamento di entrate e uscite con categorizzazione.
- **Visualizzazione Dati**: Grafici interattivi per una chiara panoramica finanziaria.
- **Gestione Gruppi**: Possibilità di creare e gestire budget di gruppo.
- **Design Responsivo**: Interfaccia adattiva per desktop e dispositivi mobili.
- **Tema Chiaro/Scuro**: Possibilità di cambiare il tema dell'applicazione.
- **Sicurezza**: Integrazione con Auth0 per un'autenticazione robusta.

InPocket offre una soluzione completa per la gestione finanziaria personale, combinando funzionalità avanzate di tracciamento e analisi con un'interfaccia utente intuitiva e personalizzabile.