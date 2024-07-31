import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import 'dotenv/config'
import User from '../models/Users.js'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'user_profiles',
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const cloudinaryUploader = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Funzione per caricare un'immagine da URL
async function uploadImageFromUrl(imageUrl, userId) {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: 'user_profiles',
            public_id: `user_${userId}`,
            overwrite: true,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        });

        // Aggiorna l'URL dell'immagine nel modello User
        await User.findByIdAndUpdate(userId, { avatar: result.secure_url });

        return result.secure_url;
    } catch (error) {
        console.error('Errore nel caricamento dell\'immagine su Cloudinary:', error);
        throw error;
    }
}

export { cloudinaryUploader, uploadImageFromUrl };