import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Globe, ArrowLeft, Star, Clock, Shield } from 'lucide-react';
import { businessAPI } from '../utils/api';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await businessAPI.getById(id);
        setBusiness(res.data);
      } catch {
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-brand font-display text-xl">Cargando...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="font-display text-2xl mb-2">Negocio no encontrado</h1>
        <p className="text-content-muted mb-6">Es posible que haya sido eliminado o el enlace sea incorrecto.</p>
        <Link to="/directorio" className="btn-primary">Ir al directorio</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/directorio" className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-brand transition-colors mb-8">
          <ArrowLeft size={16} /> Volver al directorio
        </Link>

        <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Header Image */}
          <div className="h-56 bg-surface-elevated flex items-center justify-center">
            <span className="text-7xl opacity-40">
              {business.category === 'gastronomia' ? '🍽️' :
               business.category === 'servicios' ? '🔧' :
               business.category === 'comercio' ? '🛒' : '🏥'}
            </span>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-mono text-[0.65rem] uppercase tracking-widest text-brand mb-1">{business.category}</div>
                <h1 className="font-display text-3xl tracking-tight">{business.name}</h1>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/30">
                {business.status.replace(/_/g, ' ')}
              </span>
            </div>

            {business.description && (
              <p className="text-content-secondary leading-relaxed mb-6">{business.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <InfoRow icon={<MapPin size={16} />} label="Dirección" value={`${business.address?.street}, ${business.address?.city}`} />
              <InfoRow icon={<Phone size={16} />} label="Teléfono" value={business.phone} />
              {business.webProject?.websiteUrl && (
                <InfoRow icon={<Globe size={16} />} label="Web" value={business.webProject.websiteUrl} isLink />
              )}
              {business.webProject?.plan && (
                <InfoRow icon={<Star size={16} />} label="Plan" value={business.webProject.plan.charAt(0).toUpperCase() + business.webProject.plan.slice(1)} />
              )}
            </div>

            {/* Quality Metrics */}
            {business.webProject?.lighthouseScore && (
              <div className="bg-surface-elevated rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-brand" /> Calidad del sitio
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QualityBadge label="Lighthouse" value={business.webProject.lighthouseScore} ok={business.webProject.lighthouseScore >= 80} />
                  <QualityBadge label="SSL" value={business.webProject.hasSSL ? 'Sí' : 'No'} ok={business.webProject.hasSSL} />
                  <QualityBadge label="Responsive" value={business.webProject.isResponsive ? 'Sí' : 'No'} ok={business.webProject.isResponsive} />
                  <QualityBadge label="SEO" value={business.webProject.hasSEO ? 'Sí' : 'No'} ok={business.webProject.hasSEO} />
                </div>
              </div>
            )}

            {/* Tags */}
            {business.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {business.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/[0.03] rounded-full text-sm text-content-secondary">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-brand mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-content-muted">{label}</div>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">{value}</a>
        ) : (
          <div className="text-sm">{value}</div>
        )}
      </div>
    </div>
  );
}

function QualityBadge({ label, value, ok }) {
  return (
    <div className={`text-center p-3 rounded-lg border ${ok ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className={`text-lg font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>{value}</div>
      <div className="text-xs text-content-muted">{label}</div>
    </div>
  );
}
