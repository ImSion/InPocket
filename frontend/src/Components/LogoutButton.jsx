import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const { logout, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout({ 
            logoutParams: {
                returnTo: window.location.origin + '/login'
            }
        });
    };

    return (
        <>
            <div>
                {isAuthenticated && (
                    <button onClick={handleLogout}>
                        Sign Out
                    </button>
                )}
            </div>
        </>
    );
}