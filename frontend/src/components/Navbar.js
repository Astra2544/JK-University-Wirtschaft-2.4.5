/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  NAVBAR COMPONENT | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';

// Navigation Links
const links = [
  { path: '/', label: 'Home' },
  { path: '/news', label: 'News' },
  { path: '/kalender', label: 'Kalender' },
  { path: '/team', label: 'Team' },
  { path: '/studium', label: 'Studium' },
  { path: '/lva', label: 'LVA' },
  { path: '/studienplaner', label: 'Studienplaner' },
  { path: '/magazine', label: 'Ceteris Paribus' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  
  // Check if admin is logged in
  const admin = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  
  useEffect(() => { 
    const fn = () => setScrolled(window.scrollY > 15); 
    window.addEventListener('scroll', fn); 
    return () => window.removeEventListener('scroll', fn); 
  }, []);
  
  useEffect(() => setOpen(false), [loc]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setShowUserMenu(false);
    navigate('/');
  };

  // Don't show navbar on admin panel or login page
  if (loc.pathname.startsWith('/admin') || loc.pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Gradient Line */}
      <div className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-gold-500 to-blue-500 z-[60]" />
      
      {/* Header */}
      <motion.header 
        data-testid="navbar"
        initial={{ y: -60 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-[3px] inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1120px] mx-auto px-5 flex items-center justify-between h-[58px]">
          
          {/* Logo */}
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
            <img 
              src="/images/logo.png" 
              alt="ÖH Wirtschaft Logo" 
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="leading-none">
              <span className="text-[17px] font-bold text-slate-900">Wirtschaft</span>
              <span className="block text-[11px] text-slate-400 font-medium mt-0.5">ÖH JKU Linz</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link 
                key={l.path} 
                to={l.path} 
                data-testid={`nav-link-${l.path.replace('/', '') || 'home'}`}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  loc.pathname === l.path 
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          
          {/* Right Side: Contact Button + User Icon */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/contact" 
              data-testid="nav-contact-btn"
              className="inline-flex items-center text-[13px] font-semibold text-white bg-blue-500 hover:bg-blue-600 px-4 py-[7px] rounded-full transition-colors"
            >
              Kontakt
            </Link>
            
            {/* User Icon / Menu */}
            <div className="relative" data-user-menu>
              <button
                onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                data-testid="nav-user-btn"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isLoggedIn 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <User size={18} />
              </button>
              
              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{admin?.display_name}</p>
                      <p className="text-xs text-slate-400">{admin?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/admin"
                        data-testid="nav-admin-link"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <User size={16} /> Admin Panel
                      </Link>
                      <button
                        onClick={handleLogout}
                        data-testid="nav-logout-btn"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} /> Abmelden
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile: User Icon + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => isLoggedIn ? navigate('/admin') : navigate('/login')}
              data-testid="nav-user-mobile"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLoggedIn 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <User size={18} />
            </button>
            <button 
              data-testid="nav-mobile-toggle" 
              onClick={() => setOpen(!open)} 
              className="text-slate-600 p-1 -mr-1"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div 
            data-testid="mobile-menu" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-1 mt-2">
              {links.map((l, i) => (
                <motion.div 
                  key={l.path} 
                  initial={{ opacity: 0, x: -12 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={l.path} 
                    data-testid={`mobile-nav-${l.path.replace('/', '') || 'home'}`}
                    className={`block py-3 px-3 rounded-xl text-lg font-semibold transition-colors ${
                      loc.pathname === l.path 
                        ? 'text-blue-500 bg-blue-50' 
                        : 'text-slate-800'
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.a 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.3 }}
                href="mailto:wirtschaft@oeh.jku.at"
                className="mt-4 text-center text-white bg-blue-500 rounded-full py-3 font-semibold"
              >
                Kontakt
              </motion.a>
              
              {isLoggedIn ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-2 flex gap-2"
                >
                  <Link
                    to="/admin"
                    className="flex-1 text-center text-blue-600 bg-blue-50 rounded-full py-3 font-semibold"
                  >
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 text-center text-red-600 bg-red-50 rounded-full py-3 font-semibold"
                  >
                    Abmelden
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link
                    to="/login"
                    className="mt-2 block text-center text-slate-600 bg-slate-100 rounded-full py-3 font-semibold"
                  >
                    Admin Login
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
