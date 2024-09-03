// Importazione delle dipendenze necessarie
import multer from "multer";  // Middleware per la gestione dell'upload di file
import { v2 as cloudinary } from 'cloudinary';  // SDK di Cloudinary per l'interazione con il servizio
import { CloudinaryStorage } from 'multer-storage-cloudinary'  // Storage engine di Cloudinary per Multer
import 'dotenv/config'  // Carica le variabili d'ambiente dal file .env

// Configurazione di Cloudinary con le credenziali dall'ambiente
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Nome del cloud Cloudinary
    api_key: process.env.CLOUDINARY_API_KEY,        // Chiave API di Cloudinary
    api_secret: process.env.CLOUDINARY_API_SECRET   // Segreto API di Cloudinary
});

// Creazione di un'istanza di CloudinaryStorage per configurare l'upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,  // Istanza di Cloudinary da utilizzare
    params: {
        folder: 'user_avatars',  // Cartella di destinazione su Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif']  // Formati di file consentiti
    }
});

// Configurazione di Multer con lo storage Cloudinary e limiti di upload
const cloudinaryUploader = multer({
    storage: storage,  // Usa lo storage Cloudinary configurato
    limits: {
       fileSize: 5 * 1024 * 1024  // Limite la dimensione del file a 5 MB
    }
});

// Esportazione del middleware configurato per l'uso in altre parti dell'applicazione
export default cloudinaryUploader;