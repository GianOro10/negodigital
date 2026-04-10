import { Link } from 'react-router-dom';
import { Search, Zap, ArrowRight, Shield, Globe, Smartphone, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-brand/10 blur-[120px] -top-24 -right-24 animate-float" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] -bottom-12 -left-12 animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-surface-card border border-brand/20 rounded-full text-xs font-medium text-brand mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
            Plataforma #1 en digitalización de negocios locales
          </div>

          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            Descubre negocios<br />
            <em className="italic text-brand">sin presencia digital</em><br />
            y crea su web
          </h1>

          <p className="text-lg text-content-secondary max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Conectamos negocios locales que no tienen página web con profesionales que pueden crearles su presencia digital.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <Link to="/registro" className="btn-primary flex items-center gap-2">
              <Zap size={18} /> Comenzar gratis
            </Link>
            <Link to="/directorio" className="btn-secondary flex items-center gap-2">
              <Search size={18} /> Explorar directorio
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            {[
              ['12,847', 'Negocios registrados'],
              ['3,291', 'Webs creadas'],
              ['847', 'Digitalizadores'],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl text-brand">{num}</div>
                <div className="text-xs text-content-muted uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="como-funciona" className="py-24 bg-surface-secondary border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label">Cómo funciona</div>
            <h2 className="section-title">De invisible a digital en <em className="italic text-brand">4 pasos</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '🔍', title: 'Scout descubre', desc: 'Encuentra negocios sin web y los registra con fotos y ubicación.', color: 'text-brand border-brand' },
              { icon: '✅', title: 'Verificación', desc: 'Se confirma que no tiene web y se obtiene consentimiento del dueño.', color: 'text-blue-400 border-blue-400' },
              { icon: '🎨', title: 'Creador diseña', desc: 'Un profesional toma el proyecto y construye la web.', color: 'text-green-400 border-green-400' },
              { icon: '🚀', title: 'Lanzamiento', desc: 'Web publicada, SEO optimizado. El negocio recibe clientes de internet.', color: 'text-yellow-400 border-yellow-400' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className={`w-14 h-14 rounded-full border-2 ${step.color} flex items-center justify-center font-display text-lg mx-auto mb-4 bg-surface-primary`}>
                  {i + 1}
                </div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-content-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label">Características</div>
            <h2 className="section-title">Todo lo que necesitas para <em className="italic text-brand">digitalizar</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Globe size={24} />, title: 'Detección automática', desc: 'Verificamos automáticamente que el negocio no tenga web activa.' },
              { icon: <Shield size={24} />, title: 'Pagos seguros (Escrow)', desc: 'Dinero retenido hasta aprobación. Liberación automática a las 48h.' },
              { icon: <Smartphone size={24} />, title: 'Webs responsive', desc: 'Todas las webs pasan Lighthouse ≥ 80, SSL, SEO y responsive.' },
              { icon: <BarChart3 size={24} />, title: 'Métricas en vivo', desc: 'Dashboard con visitas, clics y solicitudes de dirección.' },
              { icon: <Search size={24} />, title: 'Directorio público', desc: 'Cualquiera puede encontrar negocios que necesitan web.' },
              { icon: <Zap size={24} />, title: 'Comisiones scout', desc: '10% de comisión por cada negocio que reportes y se digitalice.' },
            ].map((feat, i) => (
              <div key={i} className="card p-8">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-5">
                  {feat.icon}
                </div>
                <h3 className="font-display text-xl mb-2">{feat.title}</h3>
                <p className="text-sm text-content-secondary leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="precios" className="py-24 bg-surface-secondary border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label">Precios</div>
            <h2 className="section-title">Planes para cada <em className="italic text-brand">necesidad</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Starter', price: '$99', desc: 'Landing page básica', features: ['1 página', 'Responsive', 'Google Maps', 'Formulario contacto', 'SSL + Hosting 1 año'] },
              { name: 'Profesional', price: '$299', desc: 'Sitio completo con SEO', featured: true, features: ['Hasta 5 páginas', 'SEO optimizado', 'Blog + Galería', 'WhatsApp Business', 'Analytics', 'Dominio .com incluido'] },
              { name: 'Enterprise', price: '$599', desc: 'E-commerce completo', features: ['Páginas ilimitadas', 'Tienda online', 'Pasarela de pagos', 'CRM básico', 'Soporte 24/7'] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 relative ${
                  plan.featured
                    ? 'bg-surface-card border-2 border-brand shadow-[0_0_60px_rgba(232,255,89,0.06)]'
                    : 'bg-surface-card border border-white/5'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand text-surface-primary text-[0.65rem] font-bold uppercase tracking-wider rounded-full">
                    Más popular
                  </div>
                )}
                <div className="font-semibold mb-1">{plan.name}</div>
                <div className="font-display text-4xl tracking-tight mb-1">{plan.price}<span className="text-base text-content-muted">/único</span></div>
                <p className="text-sm text-content-muted mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-content-secondary">
                      <span className="text-brand text-xs">✦</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/registro"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.featured
                      ? 'bg-brand text-surface-primary hover:shadow-[0_8px_30px_rgba(232,255,89,0.2)]'
                      : 'bg-surface-elevated border border-white/5 hover:border-content-muted'
                  }`}
                >
                  {plan.featured ? 'Elegir plan' : 'Empezar'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,255,89,0.05),transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
            ¿Listo para <em className="italic text-brand">digitalizar</em>?
          </h2>
          <p className="text-content-secondary mb-8">
            Únete a la comunidad que está transformando el comercio local.
          </p>
          <Link to="/registro" className="btn-primary inline-flex items-center gap-2 text-lg !py-4 !px-10">
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
