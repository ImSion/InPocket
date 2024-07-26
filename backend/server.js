import express from 'express'; // Framework web per Node.js
import mongoose from 'mongoose'; // ODM per MongoDB
import dotenv from 'dotenv'; // Per caricare variabili d'ambiente da file .env
import cors from 'cors'; // Middleware per gestire CORS (Cross-Origin Resource Sharing)
import listEndpoints from 'express-list-endpoints' // Utility per elencare gli endpoints dell'app
import usersRoutes from './routes/usersRoutes.js'


dotenv.config();

const app = express();

app.use(cors())
app.use(express.json());

mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB connesso correttamente'))
.catch((err) => console.error('Errore', err))

app.use('/api/users', usersRoutes)

const PORT = process.env.PORT || 5002

app.listen(PORT, () => {
    console.log('In ascolto sulla porta ' + PORT);
    console.table(
        listEndpoints(app)
    )
})