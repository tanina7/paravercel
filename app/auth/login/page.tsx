import LoginForm from './LoginForm';

export const metadata = {
  title: 'Iniciar Sesión - Sistema de Trámites | UNIVALLE',
  description: 'Acceso al sistema de trámites de Universidad del Valle',
};

export default function LoginPage() {
  return (
    // Agregamos bg-white explícitamente para matar cualquier fondo negro por defecto
    <div className="min-h-screen flex items-center justify-center relative bg-white font-sans selection:bg-[#8B1A1A] selection:text-white">
      
      {/* --- Elementos Decorativos de Fondo (Luminosos y Limpios) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Gradiente superior suave */}
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-red-50/80 to-white"></div>
        
        {/* Destellos difuminados en las esquinas */}
        <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-red-100/50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] -left-[5%] w-[50vw] h-[50vw] rounded-full bg-gray-100/80 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 flex flex-col items-center">
        
        {/* --- Cabecera de Marca --- */}
        <div className="text-center mb-8 w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8B1A1A] to-[#6b1414] rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-5 shadow-[0_8px_20px_rgba(139,26,26,0.2)]">
            UV
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-500 font-medium">
            Portal Integrado de Trámites Universitarios
          </p>
        </div>

        {/* --- Contenedor de tu Formulario --- */}
        <div className="w-full relative z-20">
          <LoginForm />
        </div>

        {/* --- Footer --- */}
        <div className="mt-10 text-center text-xs font-medium text-gray-400">
          <p>© {new Date().getFullYear()} Universidad Privada del Valle.</p>
          <p className="mt-1">Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  );
}