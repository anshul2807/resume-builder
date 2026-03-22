import React from 'react';

const Input = ({ label, name, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
      />
    </div>
  );
};

export default Input;