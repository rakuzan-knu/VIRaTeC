import React, { useState } from 'react';
import { Input } from '@/shared/ui/input';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@knu.ua"
      />

      <div className="flex flex-col gap-[6px]">
        <label className="text-[12px] font-medium text-[#0B1F3A]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-[54px] pl-[15px] pr-[45px] bg-white border border-[#D7E0E8] rounded-[9px] text-[16px] text-[#0B1F3A] placeholder-[#A7B0BD] focus:outline-none focus:border-[#082455] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[15px] top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <img
              src="https://storage.googleapis.com/codeless-app.appspot.com/uploads%2Fimages%2F0SdWTi9_BSMxQsBO8Gfv%2F1b33689c-1e32-419f-9653-479bf303de32.png"
              alt="Toggle Password"
              className="w-[15px] h-[10px] object-contain"
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end items-center gap-1 text-[12px]">
        <span className="text-[#8B97A6]">Forgot your password?</span>
        <a href="#reset" className="text-[#082455] font-medium hover:underline">
          Reset it
        </a>
      </div>

      <button
        type="submit"
        className="w-full h-[58px] bg-[#082455] rounded-[9px] text-white text-[14px] font-medium flex items-center justify-between px-[21px] hover:bg-[#061b40] transition-colors mt-2 cursor-pointer"
      >
        <span>Log in to your account</span>
        <img
          src="https://storage.googleapis.com/codeless-app.appspot.com/uploads%2Fimages%2F0SdWTi9_BSMxQsBO8Gfv%2F1dcba1dd-952d-4d9d-beb3-a94e8701fc45.png"
          alt="Arrow"
          className="w-[12px] h-[10px] object-contain"
        />
      </button>

      <div className="flex items-center justify-center gap-1 text-[12px] mt-2">
        <span className="text-[#8B97A6]">Don't have an account?</span>
        <a href="#signup" className="text-[#082455] font-medium hover:underline">
          Create an account
        </a>
      </div>
    </form>
  );
};
