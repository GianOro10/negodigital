import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBusinesses } from '../hooks';
import { useAuth } from '../context/AuthContext';
import BusinessCard from '../components/BusinessCard';

const categories = [
  { value: '', label: 'Todos' },
  { value: 'gastronomia', label: '🍽️ Gastronomía' },
  { value: 'servicios', label: '🔧 Servicios' },
  { value: 'comercio', label: '🛒 Comercio' },
  { value: 'salud', label: '🏥 Salud' },
];

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const { businesses, pagination, loading, error, updateFilters, nextPage, prevPage } = useBusinesses({ limit: 12 });
  const { isAuthenticated, isScout, isOwner } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    updateFilters({ category: cat || undefined });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label">Directorio</div>
          <h1 className="section-title">Negocios esperando su <em className="italic text-brand">página web</em></h1>
          <p className="text-content-secondary max-w-lg mx-auto">
            Explora negocios sin presencia digital. Elige uno y comienza a crear su web.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, ciudad o categoría..."
              className="input !pl-12"
            />
          </form>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategory(cat.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'bg-brand/10 border border-brand/30 text-brand'
                    : 'bg-surface-card border border-white/5 text-content-secondary hover:border-brand/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isAuthenticated && (isScout || isOwner) && (
            <Link
              to="/agregar-negocio"
              className="btn-primary flex items-center gap-2 whitespace-nowrap !py-3"
            >
              <Plus size={18} /> Registrar negocio
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-card border border-white/5 rounded-xl overflow-hidden animate-pulse">
                <div className="h-44 bg-surface-elevated" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-surface-elevated rounded w-20" />
                  <div className="h-5 bg-surface-elevated rounded w-3/4" />
                  <div className="h-3 bg-surface-elevated rounded w-1/2" />
                  <div className="h-10 bg-surface-elevated rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-content-muted">
            <p className="text-lg mb-2">Error al cargar negocios</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-content-muted">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg">No se encontraron negocios</p>
            <p className="text-sm mt-2">Intenta con otros filtros o registra uno nuevo.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((biz) => (
                <BusinessCard key={biz._id} business={biz} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={prevPage}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-surface-card border border-white/5 disabled:opacity-30 hover:border-brand/20 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-content-secondary">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg bg-surface-card border border-white/5 disabled:opacity-30 hover:border-brand/20 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
