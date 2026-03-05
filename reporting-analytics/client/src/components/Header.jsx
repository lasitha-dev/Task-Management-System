import React from 'react';

const Header = ({onGenerateReport}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl"></span>
            <h1 className="text-xl font-bold text-white">Reporting & Analytics</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 border border-slate-600">
              <span className="text-slate-400"></span>
              <input
                type="text"
                placeholder="Search analytics..."
                className="bg-transparent text-white placeholder-slate-400 outline-none text-sm w-40"
              />
            </div>

            <button className="relative text-slate-300 hover:text-white transition">
              
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="text-slate-300 hover:text-white transition"></button>

            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-blue-600 transition">
              A
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
