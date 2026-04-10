import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  owner: '🏪 Dueño',
  scout: '🕵️ Scout',
  creator: '💻 Creador',
  agency: '🏢 Agencia',
  admin: '🛡️ Admin',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-primary/85 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-surface-primary font-bold text-sm -rotate-3">
            N
          </div>
          NegoDigital
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/directorio" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">
            Directorio
          </Link>
          <a href="/#como-funciona" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">
            Cómo funciona
          </a>
          <a href="/#precios" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">
            Precios
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-sm text-content-secondary hover:text-brand transition-colors">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button className="relative text-content-secondary hover:text-brand transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-content-muted">{roleLabels[user.role]}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/5 text-content-muted hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-primary text-sm !py-2.5 !px-5">
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-content-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-primary/97 backdrop-blur-xl border-b border-white/5 p-6 animate-fade-up">
          <div className="flex flex-col gap-4">
            <Link to="/directorio" className="text-sm font-medium text-content-secondary" onClick={() => setMobileOpen(false)}>
              Directorio
            </Link>
            <a href="/#como-funciona" className="text-sm font-medium text-content-secondary" onClick={() => setMobileOpen(false)}>
              Cómo funciona
            </a>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-brand" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-red-400 text-left">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-content-secondary" onClick={() => setMobileOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
