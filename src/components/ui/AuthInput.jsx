import React from "react";

export const AuthInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required,
  name,
  className = "",
  rightElement,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm text-neutral-500">{label}</label>}
      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          required={required}
          className={`w-full rounded-[20px] bg-[#F5F5F5] px-4 py-3.5 outline-none transition-all placeholder:text-neutral-400
            ${error ? "border border-[#EE2C34] bg-[#FFF5F5] text-[#EE2C34]" : "border-none focus:ring-1 focus:ring-neutral-200"}
          `}
          placeholder={placeholder}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-500 font-medium">{error}</div>}
    </div>
  );
};

