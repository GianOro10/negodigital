import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import { businessAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categories = [
  { value: 'gastronomia', label: '🍽️ Gastronomía' },
  { value: 'servicios', label: '🔧 Servicios' },
  { value: 'comercio', label: '🛒 Comercio' },
  { value: 'salud', label: '🏥 Salud y Belleza' },
  { value: 'educacion', label: '📚 Educación' },
  { value: 'entretenimiento', label: '🎭 Entretenimiento' },
  { value: 'tecnologia', label: '💻 Tecnología' },
  { value: 'otros', label: '📦 Otros' },
];

const consentTypes = [
  { value: 'owner', label: 'Soy el dueño del negocio' },
  { value: 'written', label: 'Tengo consentimiento escrito' },
  { value: 'verbal', label: 'Tengo consentimiento verbal' },
];

export default function AddBusinessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    consentType: user.role === 'owner' ? 'owner' : '',
    tags: '',
  });

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name || form.name.trim().length < 3)
      newErrors.name = 'Nombre obligatorio (mín. 3 caracteres)';
    if (!form.category)
      newErrors.category = 'Selecciona una categoría';
    if (!form.street || form.street.trim().length < 10)
      newErrors.street = 'Dirección completa obligatoria (mín. 10 caracteres)';
    if (!form.city || form.city.trim().length < 2)
      newErrors.city = 'Ciudad obligatoria';
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10)
      newErrors.phone = 'Teléfono obligatorio (mín. 10 dígitos)';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = 'Email no válido';
    if (!form.consentType)
      newErrors.consentType = 'Debes confirmar el consentimiento';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Corrige los errores del formulario.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
        },
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        consent: { type: form.consentType },
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        photos: ['/uploads/placeholder.jpg'],
      };

      await businessAPI.create(payload);
      toast.success('Negocio registrado. Será verificado en 24h.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Error al registrar negocio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">Registrar negocio</h1>
          <p className="text-content-secondary text-sm">
            {user.role === 'scout'
              ? 'Reporta un negocio sin presencia web y gana comisión cuando se digitalice.'
              : 'Registra tu negocio para que un profesional cree tu página web.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-card border border-white/5 rounded-2xl p-8"
        >
          {/* Nombre */}
          <FormField label="Nombre del negocio" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              className="input"
              placeholder="Ej: Taquería Don Pepe"
            />
          </FormField>

          {/* Categoría */}
          <FormField label="Categoría" required error={errors.category}>
            <select
              value={form.category}
              onChange={set('category')}
              className="input appearance-none cursor-pointer"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Descripción */}
          <FormField label="Descripción">
            <textarea
              value={form.description}
              onChange={set('description')}
              className="input resize-y min-h-[100px]"
              placeholder="Qué ofrece el negocio, horarios, especialidades..."
              maxLength={1000}
            />
            <div className="text-right text-xs text-content-muted mt-1">
              {form.description.length}/1000
            </div>
          </FormField>

          {/* Dirección */}
          <div className="mb-1">
            <div className="flex items-center gap-2 text-sm font-medium text-content-secondary mb-3">
              <MapPin size={14} className="text-brand" /> Ubicación
            </div>
          </div>

          <FormField label="Dirección completa" required error={errors.street}>
            <input
              type="text"
              value={form.street}
              onChange={set('street')}
              className="input"
              placeholder="Calle, número, colonia..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ciudad" required error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={set('city')}
                className="input"
                placeholder="Ciudad"
              />
            </FormField>
            <FormField label="Estado">
              <input
                type="text"
                value={form.state}
                onChange={set('state')}
                className="input"
                placeholder="Estado/Provincia"
              />
            </FormField>
          </div>

          <FormField label="Código postal">
            <input
              type="text"
              value={form.zipCode}
              onChange={set('zipCode')}
              className="input"
              placeholder="C.P."
            />
          </FormField>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Teléfono" required error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                className="input"
                placeholder="+52 55 1234 5678"
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="input"
                placeholder="negocio@email.com"
              />
            </FormField>
          </div>

          {/* Tags */}
          <FormField label="Etiquetas (separadas por coma)">
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              className="input"
              placeholder="tacos, comida, familiar, centro..."
            />
          </FormField>

          {/* Consentimiento */}
          {user.role !== 'owner' && (
            <FormField
              label="Consentimiento del dueño"
              required
              error={errors.consentType}
            >
              <select
                value={form.consentType}
                onChange={set('consentType')}
                className="input appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                {consentTypes
                  .filter((c) => user.role === 'owner' ? true : c.value !== 'owner')
                  .map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </FormField>
          )}

          {/* Fotos placeholder */}
          <FormField label="Fotos del negocio">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand/30 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-content-muted mb-3" />
              <p className="text-sm text-content-muted">
                Arrastra fotos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-content-muted mt-1">
                Mín. {user.role === 'owner' ? '3' : '1'} foto(s). JPG, PNG hasta 5MB.
              </p>
            </div>
          </FormField>

          {/* Business rules reminder */}
          <div className="bg-surface-elevated rounded-xl p-4 mb-6 text-xs text-content-muted leading-relaxed">
            <p className="font-medium text-content-secondary mb-2">Reglas de registro:</p>
            <ul className="space-y-1">
              <li>• El negocio NO debe tener ya una página web (se verificará)</li>
              <li>• Se requiere consentimiento verificable del dueño</li>
              <li>• El negocio debe tener una ubicación física real</li>
              {user.role === 'scout' && (
                <li>• Máximo 5 reportes por día · Comisión: 10% por digitalización</li>
              )}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Registrando...'
            ) : (
              <>
                <Upload size={18} /> Registrar negocio
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-content-secondary mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
