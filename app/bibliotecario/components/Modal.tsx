'use client'
import { useState } from 'react';

export default function Modal({ title, onClose, onSubmit }: any) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      {/* CONTENEDOR */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        {/* TITULO */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {title}
        </h2>

        {/* TEXTAREA */}
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900"
          placeholder="Escribe una observación..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* BOTONES */}
        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            onClick={() => onSubmit(text)}
            className="px-4 py-2 rounded-lg bg-red-900 text-white hover:bg-red-800 transition"
          >
            Guardar
          </button>

        </div>
      </div>
    </div>
  );
}