import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { updateUser, registerUser } from "../Modules/ApiCrud";

export default function Register({ userData, updateUserData }) {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    data_di_nascita: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth0();

  useEffect(() => {
    if (userData) {
      setFormData({
        nome: userData.nome || user.given_name || "",
        cognome: userData.cognome || user.family_name || "",
        email: userData.email || user.email || "",
        data_di_nascita: userData.data_di_nascita 
          ? new Date(userData.data_di_nascita).toISOString().split('T')[0] 
          : "",
      });
    }
    setIsLoading(false);
  }, [userData, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let updatedUser;
      if (userData && userData._id) {
        updatedUser = await updateUser(userData._id, {
          ...formData,
          isProfileComplete: true,
        });
      } else {
        updatedUser = await registerUser({
          ...formData,
          auth0Id: user.sub,
          avatar: user.picture,
          provider: user.sub.split('|')[0],
          isProfileComplete: true
        });
      }
      updateUserData(updatedUser);
      navigate("/home");
    } catch (error) {
      console.error("Errore durante il completamento del profilo:", error);
      alert("Errore durante il completamento del profilo. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form 
        className="w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl mb-6 text-center">Completa il tuo profilo</h1>

        <div className="mb-4">
          <input 
            name="nome" 
            type="text" 
            placeholder="Nome" 
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <input 
            name="cognome" 
            type="text" 
            placeholder="Cognome" 
            value={formData.cognome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <input 
            name="data_di_nascita" 
            type="date" 
            value={formData.data_di_nascita}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button 
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Caricamento..." : "Completa profilo"}
        </button>
      </form>
    </div>
  );
}