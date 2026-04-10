import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8 bg-surface-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-xl mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-surface-primary font-bold text-sm -rotate-3">N</div>
              NegoDigital
            </Link>
            <p className="text-sm text-content-muted leading-relaxed max-w-xs">
              Conectamos negocios locales sin presencia digital con profesionales que crean su web.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-content-secondary mb-4">Plataforma</h4>
            <div className="flex flex-col gap-2">
              <Link to="/directorio" className="text-sm text-content-muted hover:text-content-primary transition-colors">Directorio</Link>
              <a href="/#precios" className="text-sm text-content-muted hover:text-content-primary transition-colors">Precios</a>
              <a href="/api" className="text-sm text-content-muted hover:text-content-primary transition-colors">API Docs</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-content-secondary mb-4">Roles</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-content-muted">Dueños de negocio</span>
              <span className="text-sm text-content-muted">Scouts digitales</span>
              <span className="text-sm text-content-muted">Creadores web</span>
              <span className="text-sm text-content-muted">Agencias partner</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-content-secondary mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-content-muted">Términos de servicio</span>
              <span className="text-sm text-content-muted">Privacidad (RGPD)</span>
              <span className="text-sm text-content-muted">Cookies</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex items-center justify-between text-xs text-content-muted">
          <span>&copy; 2026 NegoDigital. Todos los derechos reservados.</span>
          <span>Hecho con ⚡ por la comunidad</span>
        </div>
      </div>
    </footer>
  );
}
