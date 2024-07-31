import jwt from 'jsonwebtoken';

// Funzione che genera un token JWT (jsonwebtoken)
export const generateJWT = (payload) => {

    //restituisco una promise che mi gestirà l'operazione
    return new Promise((resolve, reject) =>
        jwt.sign(
            payload, // Il payload contiene i dati che vogliamo includere nel token (es. ID utente)
            process.env.JWT_SECRET, // La chiave segreta usata per firmare il token, memorizzata nelle variabili d'ambiente
            { expiresIn: "1 day" }, // Opzioni: imposta la scadenza del token a 1 giorno
            (err, token) => {
                if(err) reject(err) // Se c'è un errore, rifiuta la Promise
                else resolve(token) // Altrimenti, risolve la Promise con il token generato
            }
        )    
    )
}

// Funzione che verifica il token JWT
export const verifyJWT = (token) => {
    // Restituisce una Promise per gestire l'operazione in modo asincrono
    return new Promise((resolve, reject) =>
        // Uso il metodo verify per decodificare/verificare il token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            //se c'è errore vado in reject
            if(err) reject(err);
            //altrimenti passo il token decodificato
            else resolve(decoded);    
        })
    )
}