import React, { useRef, useState, useEffect } from "react";

export const CodeInput = ({ length = 4, onComplete }) => {
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
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasteData)) return;

    const newValues = [...values];
    pasteData.split("").forEach((char, i) => {
      newValues[i] = char;
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
    <div className="flex gap-3 justify-center">
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-14 h-14 rounded-2xl bg-[#F5F5F5] text-center text-2xl font-semibold outline-none focus:ring-1 focus:ring-neutral-300 transition-all caret-transparent selection:bg-transparent"
        />
      ))}
    </div>
  );
};

