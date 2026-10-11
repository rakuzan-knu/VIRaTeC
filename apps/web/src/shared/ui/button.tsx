import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles =
    'w-full h-[58px] rounded-[9px] font-medium transition-colors cursor-pointer flex items-center justify-center';

  const variants = {
    primary: 'bg-[#082455] text-white hover:bg-[#061b40] justify-between px-[21px]',
    secondary: 'bg-white text-[#082455] border border-[#D7E0E8] hover:bg-slate-50 gap-3',
    outline: 'bg-transparent text-[#082455] border border-[#082455] hover:bg-[#082455]/5',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
