import React, { useRef, useState } from "react";

/**
 * CodeInput - Компонент для ввода кода подтверждения
 * По умолчанию 6 цифр (формат xxx-xxx)
 */
export const CodeInput = ({ length = 6, onComplete }) => {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    if (val && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    // Удаляем все нецифровые символы (включая дефисы) и берём первые length цифр
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasteData) return;

    const newValues = [...values];
    pasteData.split("").forEach((char, i) => {
      if (i < length) {
        newValues[i] = char;
      }
    });
    setValues(newValues);
    
    if (newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""));
    }
    
    // Focus last filled or first empty
    const nextEmptyIndex = newValues.findIndex(v => v === "");
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center items-center">
      {values.map((val, index) => (
        <React.Fragment key={index}>
          <input
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`
              w-12 h-14 rounded-xl bg-[#F5F5F5] text-center text-2xl font-semibold 
              outline-none focus:ring-2 focus:ring-neutral-300 transition-all 
              caret-transparent selection:bg-transparent
              ${val ? 'bg-white border border-neutral-200' : ''}
            `}
          />
          {/* Разделитель после третьего элемента */}
          {index === 2 && <span className="text-neutral-300 text-2xl mx-1">|</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
