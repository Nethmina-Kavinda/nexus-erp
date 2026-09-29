import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main key={pathname} className="flex-1 overflow-y-auto fade-in">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 pt-2 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
