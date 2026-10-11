import React from 'react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative m-[41px] w-[574px] shrink-0 rounded-[26px] overflow-hidden flex flex-col justify-between p-[62px] hidden lg:flex">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/codeless-app.appspot.com/o/projects%2F0SdWTi9_BSMxQsBO8Gfv%2F4a587c782abf0a961ecc1c43e0a10a53a6552d74Image.png?alt=media&token=fef03124-a099-4c84-a5d5-530e61890768')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#041A3A]/34 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#041A3A]/70 via-[#041A3A]/08 to-[#041A3A]/66" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col gap-4 lg:gap-6">
        <span className="text-[#77C447] text-[10px] lg:text-[11px] font-medium tracking-[2px] uppercase">
          VIRaTeC Global Network
        </span>

        <div className="flex flex-col text-[36px] lg:text-[48px] xl:text-[59px] font-medium tracking-[-2px] lg:tracking-[-3px] leading-[1.05]">
          <h1 className="text-white">Connect your ideas</h1>
          <span className="text-[#77C447]">with the global network.</span>
        </div>

        <p className="text-white/75 text-[14px] lg:text-[17px] leading-[1.5] max-w-[417px]">
          Join an international research and education community built at Taras Shevchenko National
          University of Kyiv.
        </p>
      </div>

      {/* Bottom Badge / Logo */}
      <div
        className="relative z-10 w-[200px] lg:w-[254px] h-[55px] lg:h-[70px] rounded-[14px] border border-white/20 overflow-hidden bg-contain bg-no-repeat bg-center"
        style={{
          backgroundImage: `url('https://storage.googleapis.com/codeless-app.appspot.com/uploads%2Fimages%2F0SdWTi9_BSMxQsBO8Gfv%2F5344eb8a-f783-4706-b141-fd6501c1e3c8.png')`,
        }}
      />
    </div>
  );
};
