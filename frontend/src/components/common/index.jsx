import { Link } from 'react-router-dom';
import { Search, Github, Linkedin, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Lost<span className="text-primary-400">&</span>Found
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              A centralized platform for campus community to report lost items and find their belongings. 
              Connecting students and making campus life easier.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/items?type=lost" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  Lost Items
                </Link>
              </li>
              <li>
                <Link to="/items?type=found" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  Found Items
                </Link>
              </li>
              <li>
                <Link to="/post" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  Report Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@campuslf.com" className="text-gray-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@campuslf.com
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Campus Lost & Found. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for campus community
          </p>
        </div>
      </div>
    </footer>
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-gray-700 border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} glass-card p-6 animate-scale-in`}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary !py-2">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`btn-primary !py-2 ${danger ? '!from-red-600 !to-red-500 hover:!from-red-500 hover:!to-red-400' : ''}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
