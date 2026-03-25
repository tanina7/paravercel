'use client'
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState({
    id_usuario: 1,
    nombre: 'Bibliotecario Demo',
    rol: 'Biblioteca',
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);