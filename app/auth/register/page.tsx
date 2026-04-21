'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    documentType: 'CI Boliviano',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return false;
    }
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(formData.firstName)) {
      setError('El nombre solo debe contener letras y espacios');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      setError('El apellido debe tener al menos 2 caracteres');
      return false;
    }
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(formData.lastName)) {
      setError('El apellido solo debe contener letras y espacios');
      return false;
    }

    if (!formData.idNumber.trim()) {
      setError('La cédula de identidad es requerida');
      return false;
    }
    if (formData.idNumber.trim().length < 5) {
      setError('La cédula debe tener al menos 5 caracteres');
      return false;
    }
    if (formData.idNumber.trim().length > 20) {
      setError('La cédula no puede exceder 20 caracteres');
      return false;
    }
    if (!/^[0-9\-]+$/.test(formData.idNumber)) {
      setError('La cédula solo puede contener números y guiones');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError('El correo electrónico no es válido');
      return false;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password.length > 50) {
      setError('La contraseña no puede exceder 50 caracteres');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Debe confirmar la contraseña');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          idNumber: formData.idNumber,
          documentType: formData.documentType,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrar');
        setLoading(false);
        return;
      }

      router.push('/auth/login?registered=true');
    } catch {
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-t-[6px] border-[#800000] bg-white shadow-2xl">
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex flex-col items-center">
            <h2 className="text-xl font-bold text-[#800000] sm:text-2xl">Crear Cuenta</h2>
            <p className="text-sm font-medium text-gray-500 sm:text-base">Completa el formulario para registrarte</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  pattern="^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$"
                  title="Solo letras y espacios"
                  placeholder="Juan"
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  pattern="^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$"
                  title="Solo letras y espacios"
                  placeholder="Pérez"
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={20}
                pattern="^[0-9\-]+$"
                title="Solo números y guiones"
                placeholder="12345-6"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              >
                <option value="CI Boliviano">CI Boliviano</option>
                <option value="Pasaporte Extranjero">Pasaporte Extranjero</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                maxLength={100}
                placeholder="usuario@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={50}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={50}
                placeholder="Repetir contraseña"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 text-sm placeholder-gray-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#800000] text-white font-semibold rounded-lg hover:bg-[#600000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:py-3"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p className="text-center text-xs sm:text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#800000] font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
