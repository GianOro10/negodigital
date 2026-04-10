import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Completa todos los campos.');

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">Iniciar sesión</h1>
          <p className="text-content-secondary text-sm">Accede a tu cuenta de NegoDigital</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-card border border-white/5 rounded-2xl p-8">
          <div className="mb-5">
            <label className="block text-sm font-medium text-content-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-content-secondary mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input !pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : <><LogIn size={18} /> Iniciar sesión</>}
          </button>

          <p className="text-center text-sm text-content-muted mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-brand hover:underline">Regístrate</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-content-muted text-center mb-3">Credenciales de prueba:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Admin', 'admin@negodigital.com'],
                ['Owner', 'roberto@email.com'],
                ['Scout', 'carlos@email.com'],
                ['Creator', 'laura@email.com'],
              ].map(([role, mail]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setEmail(mail); setPassword('Password123'); }}
                  className="px-3 py-2 rounded-lg bg-surface-elevated text-content-muted hover:text-brand hover:border-brand/20 border border-transparent transition-all text-left"
                >
                  <div className="font-medium">{role}</div>
                  <div className="text-[0.65rem] opacity-60">{mail}</div>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
