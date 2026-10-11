import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && <label className="text-[12px] font-medium text-[#0B1F3A]">{label}</label>}
      <input
        className={`w-full h-[54px] px-[15px] bg-white border border-[#D7E0E8] rounded-[9px] text-[16px] text-[#0B1F3A] placeholder-[#A7B0BD] focus:outline-none focus:border-[#082455] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};
