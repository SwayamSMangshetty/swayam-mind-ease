import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-app flex flex-col transition-colors duration-200">
      <main className="flex-1 pb-20">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;