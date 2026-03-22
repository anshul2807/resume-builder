import React from 'react';

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyles = "px-4 py-2 rounded font-bold text-sm transition-all";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "text-red-600 hover:text-red-800"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;