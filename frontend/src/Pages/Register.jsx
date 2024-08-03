import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { updateUser } from "../Modules/ApiCrud";

export default function Register() {
  const { userData, setUserData } = useOutletContext();
  const [formData, setFormData] = useState({
    nome: userData?.nome || "",
    cognome: userData?.cognome || "",
    data_di_nascita: userData?.data_di_nascita || "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser(userData.email, {
        ...formData,
        isProfileComplete: true,
      });
      setUserData(updatedUser);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Errore durante il completamento del profilo:", error);
      alert("Errore durante il completamento del profilo. Riprova.");
    }
  };


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
        >
          Completa profilo
        </button>
      </form>
    </div>
  );
}