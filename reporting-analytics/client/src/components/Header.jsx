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
          <div className="hidden md:flex items-center gap-2 px-4 py-2 
          bg-[#1e293b] border border-[#334155] rounded-lg 
          text-gray-400 text-sm w-64 focus-within:border-blue-500 
          focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search analytics..."
              className="bg-transparent outline-none text-white 
              placeholder-gray-500 text-sm w-full"
            />
          </div>

            <button className="relative text-slate-300 hover:text-white transition">
              
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="text-slate-300 hover:text-white transition"></button>

            <button onClick={onGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg text-sm font-medium transition-colors">
              + Generate Report
            </button>

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
