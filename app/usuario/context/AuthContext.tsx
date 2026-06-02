'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        console.log('Fetching session status from /api/auth/verify...');
        const res = await fetch('/api/auth/verify');
        console.log('Session status response code:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Session status response data:', data);
          if (data.success && data.user) {
            setUser({
              id_usuario: data.user.id,
              nombre: data.user.name || data.user.username,
              rol: data.user.role,
              email: data.user.email,
              ...data.user,
            });
            console.log('User state updated successfully in AuthContext:', data.user);
          } else {
            console.log('Session verification failed or no user:', data);
            setUser(null);
            // Limpiar localStorage si no hay sesión válida
            localStorage.removeItem('carrito-tramites');
            localStorage.removeItem('solicitud-data');
          }
        } else {
          console.log('Session verification request failed with status:', res.status);
          setUser(null);
          // Limpiar localStorage si falla la verificación
          localStorage.removeItem('carrito-tramites');
          localStorage.removeItem('solicitud-data');
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    if (pathname && !pathname.startsWith('/auth')) {
      checkSession();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // Limpiar localStorage antes de redireccionar
        localStorage.removeItem('carrito-tramites');
        localStorage.removeItem('solicitud-data');
        setUser(null);
        window.location.href = '/auth/login';
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);