import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showSettings?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = 'MindEase', showSettings = true }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-app-light border-b border-app-muted px-4 py-3 sticky top-0 z-40 transition-colors duration-200">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-app truncate transition-colors duration-200">{title}</h1>
        {showSettings && (
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 text-app-muted hover:text-app hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;