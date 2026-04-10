import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const categoryEmojis = {
  gastronomia: '🍽️',
  servicios: '🔧',
  comercio: '🛒',
  salud: '🏥',
  educacion: '📚',
  entretenimiento: '🎭',
  tecnologia: '💻',
  otros: '📦',
};

const statusConfig = {
  pending_verification: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  verified: { label: 'Disponible', color: 'text-brand bg-brand/10 border-brand/30' },
  assigned: { label: 'Asignado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_progress: { label: 'En progreso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_review: { label: 'En revisión', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  published: { label: 'Publicado', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  rejected: { label: 'Rechazado', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export default function BusinessCard({ business }) {
  const emoji = categoryEmojis[business.category] || '📦';
  const status = statusConfig[business.status] || statusConfig.pending_verification;

  return (
    <Link to={`/negocios/${business._id || business.id}`} className="card overflow-hidden group cursor-pointer">
      {/* Image placeholder */}
      <div className="h-44 bg-surface-elevated flex items-center justify-center relative">
        <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-500">
          {emoji}
        </span>
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="font-mono text-[0.65rem] uppercase tracking-widest text-brand mb-1">
          {business.category}
        </div>
        <h3 className="font-display text-xl tracking-tight mb-1">{business.name}</h3>
        <div className="flex items-center gap-1 text-sm text-content-secondary mb-3">
          <MapPin size={13} />
          {business.address?.city || business.city}
        </div>
        {business.description && (
          <p className="text-sm text-content-muted line-clamp-2 mb-4">{business.description}</p>
        )}

        {/* Tags */}
        {business.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {business.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 bg-white/[0.03] rounded-full text-[0.7rem] text-content-secondary">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-xs text-content-muted">
            {business.webProject?.plan
              ? `Plan ${business.webProject.plan}`
              : 'Sin asignar'}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-2 transition-all">
            Ver detalle <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
