import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const AuthLayout = ({ children, title, subtitle, showBack, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-white">
      {/* Header */}
      <div className="w-full max-w-sm mb-8 relative">
        {showBack && (
          <button 
            onClick={onBack || (() => navigate(-1))}
            className="absolute -left-2 top-0 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <div className="flex flex-col items-center text-center pt-2">
            <Link to="/" className="flex items-center gap-1 mb-2">
                <span className="text-3xl font-bold text-[#EE2C34]">Я</span>
                <span className="text-3xl font-bold text-black">буду</span>
            </Link>
            <p className="text-sm text-neutral-500">Умный контроль вашего рациона</p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm">
        {title && <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>}
        {subtitle && <p className="text-neutral-500 text-center mb-8 text-sm">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

