'use client';
import { useState } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (comentario: string) => void;
}

export default function Modal({ title, onClose, onSubmit }: ModalProps) {
  const [comentario, setComentario] = useState('');

  const handleSubmit = () => {
    onSubmit(comentario);
    setComentario('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <textarea
          className="w-full border p-2 rounded mb-4"
          placeholder="Agregar comentario (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Confirmar</button>
        </div>
      </div>
    </div>
  );
}