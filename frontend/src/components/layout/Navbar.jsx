import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="border border-white/10  rounded-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#29C762] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[#FFFFFF]">
                Rosync
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-[#C3C2C4] hover:text-[#FFFFFF] transition-all duration-200 rounded-xl">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2.5 text-sm font-medium text-[#0B0B0F] bg-[#29C762] rounded-xl hover:scale-105 transition-all duration-200">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
    </nav>
  );
};

export default Navbar;