import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../api/userApi'; 
import { FaBell, FaUser, FaCode, FaCog, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import logo from '/favicon.svg';
import { useNotification } from '../context/NotificationContext';
import '../index.css';

const getInitials = (firstname, lastname) => {
  const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
  const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
  return firstInitial + lastInitial;
};

const getProfileColor = (username) => {
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
  ];
  
  let hash = 0;
  if (!username) return colors[0];
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function Navbar() {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      addNotification('Logged out successfully. See you soon!', 'info');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      const message = error.response?.data?.message || 'Logout failed';
      addNotification(message, 'error');
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/problems', label: 'Problems' },
    { path: '/contests', label: 'Contests' },
    { path: '/leaderboard', label: 'Leaderboard' },
    // FIX: Conditionally add the Admin Panel link to the main navbar
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel' }] : []),
  ];

  const userMenuItems = [
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaCode, label: 'My Submissions', path: '/submissions' },
    // FIX: Remove the Admin Panel link from the dropdown menu
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CodeVerse
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <Link to="/notifications" className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                <FaBell className="w-5 h-5" />
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${getProfileColor(user.username)}`}>
                    {getInitials(user.firstname, user.lastname)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900">{user.firstname} {user.lastname}</div>
                    <div className="text-xs text-slate-500">@{user.username}</div>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-slideIn">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${getProfileColor(user.username)}`}>
                          {getInitials(user.firstname, user.lastname)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.firstname} {user.lastname}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors duration-200"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to='/login' className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                  Sign In
                </Link>
                <Link to='/register' className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 animate-slideIn">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link to='/login' onClick={() => setIsMobileMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                    Sign In
                  </Link>
                  <Link to='/register' onClick={() => setIsMobileMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;