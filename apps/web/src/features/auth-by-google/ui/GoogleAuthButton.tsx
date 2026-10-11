import React from 'react';

export const GoogleAuthButton: React.FC = () => {
  return (
    <button
      type="button"
      className="w-full h-[58px] bg-white border border-[#D7E0E8] rounded-[9px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors mb-6 cursor-pointer"
    >
      <img
        src="https://storage.googleapis.com/codeless-app.appspot.com/uploads%2Fimages%2F0SdWTi9_BSMxQsBO8Gfv%2F4843943a-585d-490a-a810-32715ade417e.png"
        alt="Google"
        className="w-6 h-6 object-contain"
      />
      <span className="text-[13px] font-medium text-[#082455]">Continue with Google</span>
    </button>
  );
};
