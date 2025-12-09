import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Логотип Слёт - из официального SVG файла (только иконка)
const SletLogo = ({ size = 56 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 345 264" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M77.3112 93.8645C91.5939 99.6876 105.598 105.754 117.849 111.547C122.079 141.802 147.819 165.075 178.94 165.075C200.545 165.075 219.557 153.858 230.578 136.875C232.12 136.368 233.628 135.86 235.102 135.347C253.108 129.069 266.531 122.093 275.555 113.871C275.92 113.554 276.992 112.874 279.21 112.1C279.76 111.908 280.356 111.717 281 111.531C273.972 184.635 191.149 253.907 188.669 256.18C186.09 258.544 179.273 263.972 179.238 264C179.202 263.972 172.397 258.512 169.806 256.18C167.206 253.84 77.0002 178.361 77 101.79C77 99.1359 77.1052 96.4922 77.3112 93.8645Z" fill="#EE2C34"/>
    <path d="M179.238 0C206.352 4.95569e-05 232.357 10.7245 251.53 29.8136C257.393 35.6508 262.468 42.1256 266.692 49.0719C254.435 56.5152 244.347 64.5468 236.177 71.5876L233.583 73.7867C223.258 53.957 202.662 40.4342 178.94 40.4341C170.749 40.4341 162.932 42.0469 155.781 44.9738C137.463 40.6577 118.633 38.1556 99.8612 37.6385C102.076 34.9228 104.438 32.3095 106.945 29.8136C126.118 10.7243 152.123 0 179.238 0Z" fill="#EE2C34"/>
    <path d="M320.376 48.8602L274.656 91.589C274.658 91.5893 279.442 92.0992 282.417 92.8603C289.031 94.5525 298.175 100.42 298.218 100.447C298.195 100.456 293.143 102.327 286.918 103.358C279.331 104.616 274.102 106.52 271.682 108.651C255.442 123.624 221.537 135.471 163.782 146.599C121.964 154.568 100.86 156.854 101.176 153.515C101.605 150.196 121.45 136.794 136.138 129.558C136.133 129.629 136.13 129.667 136.13 129.667L174.43 112.588C174.385 112.593 157.292 114.546 146.273 118.239L134.551 112.177C97.2257 92.7623 31.8115 67.6156 0 58.5304C0.132486 58.4867 46.3418 43.2565 89.4886 42.6695C132.697 42.0816 176.867 52.5785 214.529 71.9376L233.107 81.659L240.396 75.4344C252.216 65.1725 267.91 52.9671 288.332 43.6192C309.21 34.0623 345 28 345 28L320.376 48.8602Z" fill="#EE2C34"/>
  </svg>
);

export const AuthLayout = ({ children, title, subtitle, showBack, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-6 bg-white">
      {/* Header with back button */}
      <div className="w-full max-w-sm mb-6 relative">
        {showBack && (
          <button 
            onClick={onBack || (() => navigate(-1))}
            className="absolute -left-2 top-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {/* Логотип и название - текст чёрный */}
        <div className="flex flex-col items-center text-center pt-2">
          <Link to="/" className="flex items-center gap-1 mb-1">
            <SletLogo size={48} />
            <span className="text-3xl font-bold text-neutral-900">Слёт</span>
          </Link>
          <p className="text-sm text-neutral-400">Больше, чем просто события</p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm flex-1">
        {title && <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>}
        {subtitle && <p className="text-neutral-500 text-center mb-8 text-sm">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
