'use client'
import { useState } from 'react';

export default function Modal({ title, onClose, onSubmit }: any) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comentario opcional"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-900"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-red-900 text-white hover:bg-red-800"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}