import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaList, FaTrophy, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const AdminLayout = () => {
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
    { to: '/admin/problems', label: 'Problems', icon: FaList },
    { to: '/admin/contests', label: 'Contests', icon: FaTrophy },
    { to: '/admin/users', label: 'Users', icon: FaUsers },
  ];

  const getLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-500">CodeVerse CMS</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className={getLinkClass}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
           <NavLink to="/" className={getLinkClass({})}>
              <FaSignOutAlt className="mr-3 h-5 w-5" />
              Back to Site
            </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;