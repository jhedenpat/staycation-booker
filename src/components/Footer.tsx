import { Link } from 'react-router-dom';
import { Shield, Lock, Instagram, Facebook, Linkedin } from 'lucide-react';

const NAV_LINKS = {
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Cancellation Policy', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'House Rules', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

const SOCIAL_LINKS = [
  { label: 'Instagram', Icon: Instagram, href: '#', color: 'hover:text-pink-400' },
  { label: 'Facebook',  Icon: Facebook,  href: '#', color: 'hover:text-blue-400' },
  { label: 'LinkedIn',  Icon: Linkedin,  href: '#', color: 'hover:text-sky-400'  },
];

function LinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1">{title}</h4>
      {links.map(l => (
        <a
          key={l.label}
          href={l.href}
          className="text-sm text-[#94a3b8] hover:text-white transition-colors duration-150 leading-none"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-white/5 mt-auto"
      style={{ background: '#020617' }}
    >
      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Column 1: Brand + Company */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-6">
            {/* Logo */}
            <div>
              <span className="text-white font-bold text-base leading-tight block">
                RR Twins
              </span>
              <span className="text-[#94a3b8] text-xs leading-tight block">
                Mall of Asia Staycation Units
              </span>
            </div>
            <p className="text-[#94a3b8] text-[13px] leading-relaxed max-w-[200px]">
              Premium staycation units in the heart of Manila Bay. Managed by RR Twins Hospitality.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-1">
              {SOCIAL_LINKS.map(({ label, Icon, href, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`text-[#64748b] ${color} transition-colors duration-150`}
                >
                  <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Company */}
          <LinkGroup title="Company" links={NAV_LINKS.company} />

          {/* Column 3: Support */}
          <LinkGroup title="Support" links={NAV_LINKS.support} />

          {/* Column 4: Legal */}
          <LinkGroup title="Legal" links={NAV_LINKS.legal} />
        </div>

        {/* ── Trust Row ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-white/5 mb-4"
        >
          {/* Security badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
              <Shield className="h-3 w-3 text-blue-400" />
              <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">PCI Compliant</span>
            </div>
          </div>

          {/* Payment icons (text badges — realistic look without external assets) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30 mr-1 hidden sm:inline">We accept</span>
            {[
              { label: 'VISA',       bg: '#1A1F71', color: '#fff',    width: 44 },
              { label: 'MC',         bg: '#EB001B', color: '#FFB600', width: 36 },
              { label: 'GCash',      bg: '#0070E0', color: '#fff',    width: 46 },
              { label: 'Maya',       bg: '#3BC44B', color: '#fff',    width: 44 },
            ].map(p => (
              <div
                key={p.label}
                className="flex items-center justify-center h-6 rounded text-[10px] font-black tracking-tight border border-white/10"
                style={{ background: p.bg, color: p.color, minWidth: p.width, paddingInline: 8 }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Copyright bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <p className="text-[12px] text-[#475569]">
            © {year} RR Twins Hospitality Group. All rights reserved.
          </p>
          <p className="text-[12px] text-[#334155]">
            Made with care · Pasay City, Metro Manila, PH
          </p>
        </div>
      </div>
    </footer>
  );
}
