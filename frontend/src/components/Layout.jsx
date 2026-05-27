import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main
          key={pathname}
          className="flex-1 overflow-y-auto px-8 py-7 lg:px-12 lg:py-9 fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
