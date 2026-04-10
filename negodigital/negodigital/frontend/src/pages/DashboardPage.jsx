import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, FolderOpen, Users, Star, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const roleConfig = {
  owner: { title: 'Mi Negocio', icon: '🏪', color: 'text-brand' },
  scout: { title: 'Panel Scout', icon: '🕵️', color: 'text-green-400' },
  creator: { title: 'Mis Proyectos', icon: '💻', color: 'text-blue-400' },
  agency: { title: 'Panel Agencia', icon: '🏢', color: 'text-yellow-400' },
  admin: { title: 'Administración', icon: '🛡️', color: 'text-red-400' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const config = roleConfig[user.role] || roleConfig.owner;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-3xl mb-1">{config.icon}</div>
            <h1 className="font-display text-3xl tracking-tight">{config.title}</h1>
            <p className="text-content-secondary text-sm mt-1">
              Hola, {user.fullName || user.name}. Aquí tienes un resumen de tu actividad.
            </p>
          </div>
          {(user.role === 'owner' || user.role === 'scout') && (
            <Link to="/agregar-negocio" className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Registrar negocio
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {user.role === 'scout' && (
            <>
              <StatCard icon={<FolderOpen size={20} />} label="Reportes totales" value={user.scoutStats?.totalReports || 0} color="text-brand" />
              <StatCard icon={<CheckCircle size={20} />} label="Aprobados" value={user.scoutStats?.approvedReports || 0} color="text-green-400" />
              <StatCard icon={<BarChart3 size={20} />} label="Ganancias" value={`$${user.scoutStats?.totalEarnings || 0}`} color="text-yellow-400" />
              <StatCard icon={<Star size={20} />} label="Tasa aprobación" value={user.scoutStats?.totalReports > 0 ? `${Math.round((user.scoutStats.approvedReports / user.scoutStats.totalReports) * 100)}%` : 'N/A'} color="text-blue-400" />
            </>
          )}
          {user.role === 'creator' && (
            <>
              <StatCard icon={<FolderOpen size={20} />} label="Proyectos totales" value={user.creatorStats?.totalProjects || 0} color="text-brand" />
              <StatCard icon={<CheckCircle size={20} />} label="Completados" value={user.creatorStats?.completedProjects || 0} color="text-green-400" />
              <StatCard icon={<Clock size={20} />} label="Activos" value={`${user.creatorStats?.activeProjects || 0}/3`} color="text-blue-400" />
              <StatCard icon={<Star size={20} />} label="Rating" value={user.creatorStats?.averageRating?.toFixed(1) || '0.0'} color="text-yellow-400" />
            </>
          )}
          {(user.role === 'owner' || user.role === 'admin' || user.role === 'agency') && (
            <>
              <StatCard icon={<FolderOpen size={20} />} label="Negocios" value="—" color="text-brand" />
              <StatCard icon={<BarChart3 size={20} />} label="Visitas web" value="—" color="text-green-400" />
              <StatCard icon={<Users size={20} />} label="Clics teléfono" value="—" color="text-blue-400" />
              <StatCard icon={<AlertTriangle size={20} />} label="Pendientes" value="—" color="text-yellow-400" />
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-surface-card border border-white/5 rounded-2xl p-8">
          <h2 className="font-display text-xl mb-4">Actividad reciente</h2>
          <div className="text-center py-12 text-content-muted">
            <p className="text-4xl mb-4">📊</p>
            <p className="font-medium">Conecta tu backend para ver datos en vivo</p>
            <p className="text-sm mt-2">
              Ejecuta <code className="px-2 py-0.5 bg-surface-elevated rounded text-brand font-mono text-xs">npm run dev</code> para iniciar el servidor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-surface-card border border-white/5 rounded-xl p-5">
      <div className={`${color} mb-3`}>{icon}</div>
      <div className="font-display text-2xl tracking-tight">{value}</div>
      <div className="text-xs text-content-muted mt-1">{label}</div>
    </div>
  );
}
