import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function LoginButton() {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    const handleLogin = async () => {
        try {
            await loginWithRedirect({
                appState: { returnTo: window.location.pathname },
                authorizationParams: {
                    prompt: 'login'
                }
            });
        } catch (error) {
            console.error("Errore durante il login:", error);
        }
    };

    return (
        <>
            <div>
                {!isAuthenticated && (
                    <button className='bg-sky-600 w-20 p-2 rounded-full mt-1 hover:bg-sky-700' onClick={handleLogin}>
                        Sign in
                    </button>
                )}
            </div>
        </>
    );
}