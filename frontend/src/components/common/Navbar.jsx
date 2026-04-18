import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Plus,
  User,
  LogOut,
  Settings,
  Package,
  FileText,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    const collegeStr = localStorage.getItem('selectedCollege');
    if (collegeStr) {
      try {
        setSelectedCollege(JSON.parse(collegeStr));
      } catch (e) {
        console.error('Error parsing selected college:', e);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { path: '/items?type=lost', label: 'Lost Items' },
    { path: '/items?type=found', label: 'Found Items' },
  ];

  const profileLinks = [
    { path: '/my-items', label: 'My Items', icon: Package },
    { path: '/my-claims', label: 'My Claims', icon: FileText },
    { path: '/profile', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    profileLinks.unshift({ path: '/admin', label: 'Admin Panel', icon: LayoutDashboard });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Badge */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white hidden sm:block">
                Lost<span className="text-primary-400">&</span>Found
              </span>
            </Link>

            {/* College Session Badge */}
            {selectedCollege && (
              <Link 
                to="/select-college" 
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors group cursor-pointer"
                title="Change College"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-400">🏫</span>
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[120px]">
                  {selectedCollege.shortName || selectedCollege.name}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname + location.search === link.path
                    ? 'text-primary-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Post Button */}
                <Link
                  to="/post"
                  className="btn-primary hidden sm:flex items-center gap-2 !py-2 !px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Item</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 glass-card p-2 z-20"
                        >
                          <div className="px-3 py-2 border-b border-gray-800 mb-2">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                          
                          {profileLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                              <link.icon className="w-4 h-4" />
                              <span className="text-sm">{link.label}</span>
                            </Link>
                          ))}
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full mt-2 border-t border-gray-800 pt-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost hidden sm:block">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-800 py-4"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/post"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary mx-4 mt-2 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Item</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
