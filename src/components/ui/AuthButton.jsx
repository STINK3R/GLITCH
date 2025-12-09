import React from "react";

export const AuthButton = ({ children, onClick, disabled, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-[20px] bg-[#EE2C34] text-white font-medium py-3.5 hover:bg-[#d4252c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

