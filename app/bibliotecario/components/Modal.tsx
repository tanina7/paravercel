'use client'
import { useState } from 'react';

export default function Modal({ title, onClose, onSubmit }: any) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <textarea
          className="w-full border p-2 mb-4"
          placeholder="Observación"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-400 px-4 py-2 text-white rounded">
            Cancelar
          </button>
          <button onClick={() => onSubmit(text)} className="bg-red-900 px-4 py-2 text-white rounded">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}