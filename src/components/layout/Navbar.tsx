import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Search, Users, BookOpen, LogOut, User, Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useFriendRequests } from '@/hooks/queries/friends';
import { useLogout } from '@/hooks/queries/auth';
import { getErrorMessage } from '@/api/errors';
import { Avatar, Button } from '@/components/ui';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { openAuthModal, addToast } = useUIStore();
  const { data: incomingRequests = [] } = useFriendRequests('incoming', isAuthenticated);
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
      setMenuOpen(false);
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  const navItems = [
    { to: '/', label: 'Discover', icon: <Film size={16} /> },
    { to: '/search', label: 'Search', icon: <Search size={16} /> },
    { to: '/feed', label: 'Feed', icon: <BookOpen size={16} />, auth: true },
    { to: '/friends', label: 'Friends', icon: <Users size={16} />, auth: true },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/8">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
          aria-label="Letterboxd Lite home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-300 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-300/20">
            <Film size={16} className="text-[#070B12]" />
          </div>
          <span className="hidden sm:block font-serif font-semibold text-white text-lg tracking-tight">
            Letterboxd<span className="text-sky-300">Lite</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            if (item.auth && !isAuthenticated) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-sky-300 bg-sky-300/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/8',
                  ].join(' ')
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              {incomingRequests.length > 0 && (
                <Link
                  to="/friends"
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
                  aria-label={`${incomingRequests.length} friend request${incomingRequests.length > 1 ? 's' : ''}`}
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-sky-400 rounded-full" />
                </Link>
              )}

              {/* Profile link */}
              <Link
                to="/profile/me"
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-white/8 transition-all duration-200 group"
              >
                <Avatar src={user.avatar} name={user.displayName} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {user.displayName}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 cursor-pointer"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal('register')}
              >
                Join
              </Button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#101827] px-4 py-3 flex flex-col gap-1">
          {navItems.map(item => {
            if (item.auth && !isAuthenticated) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-sky-300 bg-sky-300/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/8',
                  ].join(' ')
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          })}
          {isAuthenticated && (
            <>
              <Link
                to="/profile/me"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all"
              >
                <User size={16} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
