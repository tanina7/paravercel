'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TramiteCarrito {
  id: number;
  name: string;
  descripcion: string;
  costo: number;
  requisitos: string;
}

interface SolicitudData {
  nombreCompleto: string;
  carrera: string;
  subSede: string;
  documentos: Record<number, File[]>; // id_tipo -> archivos
}

interface CarritoContextType {
  items: TramiteCarrito[];
  solicitud: SolicitudData | null;
  agregarTramite: (tramite: TramiteCarrito) => void;
  eliminarTramite: (id: number) => void;
  vaciarCarrito: () => void;
  obtenerTotal: () => number;
  setSolicitud: (solicitud: SolicitudData) => void;
  clearSolicitud: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TramiteCarrito[]>([]);
  const [solicitud, setSolicitudState] = useState<SolicitudData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar del localStorage al montar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito-tramites');
    if (carritoGuardado) {
      try {
        const datos = JSON.parse(carritoGuardado);
        // Validar que sea un array antes de setear
        if (Array.isArray(datos)) {
          setItems(datos);
        } else {
          console.error('El carrito guardado no es un array válido');
          setItems([]);
        }
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        setItems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar a localStorage cuando cambia items
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('carrito-tramites', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const agregarTramite = (tramite: TramiteCarrito) => {
    setItems((prevItems) => {
      const existe = prevItems.find((item) => item.id === tramite.id);
      if (existe) {
        return prevItems;
      }
      // Asegurar que costo es un número
      const tramiteConCostoNumerico = {
        ...tramite,
        costo: typeof tramite.costo === 'string' ? parseFloat(tramite.costo) : Number(tramite.costo),
      };
      return [...prevItems, tramiteConCostoNumerico];
    });
  };

  const eliminarTramite = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const obtenerTotal = () => {
    return items.reduce((total, item) => {
      const costo = typeof item.costo === 'string' ? parseFloat(item.costo) : Number(item.costo);
      return total + (isNaN(costo) ? 0 : costo);
    }, 0);
  };

  const setSolicitud = (data: SolicitudData) => {
    setSolicitudState(data);
  };

  const clearSolicitud = () => {
    setSolicitudState(null);
  };

  return (
    <CarritoContext.Provider value={{ items, solicitud, agregarTramite, eliminarTramite, vaciarCarrito, obtenerTotal, setSolicitud, clearSolicitud }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
}
