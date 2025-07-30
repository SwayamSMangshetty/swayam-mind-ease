import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, TrendingUp, Brain } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: TrendingUp, label: 'Trends', path: '/trends' },
    { icon: Brain, label: 'Meditate', path: '/meditate' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-app-light border-t border-app-muted safe-area-pb z-50 transition-colors duration-200 shadow-lg h-16">
      <div className="flex justify-center px-4 py-2 h-full">
        <div className="flex justify-between items-center w-full max-w-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 active:scale-95 min-w-0 flex-1 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-app-muted hover:text-app hover:bg-app-dark'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;