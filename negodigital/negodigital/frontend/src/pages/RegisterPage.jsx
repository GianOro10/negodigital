import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { value: 'owner', icon: '🏪', label: 'Dueño de negocio', desc: 'Quiero crear la web de mi negocio' },
  { value: 'scout', icon: '🕵️', label: 'Scout Digital', desc: 'Quiero reportar negocios y ganar comisión' },
  { value: 'creator', icon: '💻', label: 'Creador Web', desc: 'Soy dev/diseñador y quiero crear webs' },
  { value: 'agency', icon: '🏢', label: 'Agencia Partner', desc: 'Gestiono múltiples proyectos' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', lastname: '', email: '', password: '', role: '', city: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value || e });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) return toast.error('Selecciona un rol.');
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      return toast.error('Contraseña: mín. 8 chars, 1 mayúscula, 1 número.');
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('Cuenta creada. Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">Crear cuenta</h1>
          <p className="text-content-secondary text-sm">Únete a NegoDigital</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-card border border-white/5 rounded-2xl p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-content-secondary mb-2">¿Cuál es tu rol? *</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    form.role === r.value
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                      : 'border-white/5 hover:border-white/10 bg-surface-elevated'
                  }`}
                >
                  <div className="text-lg mb-0.5">{r.icon}</div>
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-[0.65rem] text-content-muted">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1.5">Nombre *</label>
              <input type="text" value={form.name} onChange={set('name')} className="input" placeholder="Tu nombre" required minLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1.5">Apellido *</label>
              <input type="text" value={form.lastname} onChange={set('lastname')} className="input" placeholder="Tu apellido" required minLength={2} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-content-secondary mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="tu@email.com" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-content-secondary mb-1.5">Contraseña *</label>
            <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="Mín. 8 chars, 1 mayúscula, 1 número" required minLength={8} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-content-secondary mb-1.5">Ciudad *</label>
            <input type="text" value={form.city} onChange={set('city')} className="input" placeholder="Tu ciudad" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Creando...' : <><UserPlus size={18} /> Crear cuenta</>}
          </button>

          <p className="text-center text-sm text-content-muted mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brand hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
