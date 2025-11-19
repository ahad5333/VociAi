import React from 'react';
import { Mic } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header-container w-full py-6 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex items-center gap-3">
        <div className="header-icon-box p-2 shadow-lg">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">VociAI(By Mohammed Ahad Ullah)</h1>
          <p className="text-xs opacity-75 font-medium">Transforming Text into Natural, Expressive Voices with AI</p>
        </div>
      </div>
    </header>
  );
};

export default Header;