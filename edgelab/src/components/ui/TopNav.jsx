import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, BookOpen } from 'lucide-react';

export default function TopNav() {
  const { pathname } = useLocation();
  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/simulator', label: 'Simulator',  icon: TrendingUp },
    { to: '/playbook',  label: 'Playbook',   icon: BookOpen },
  ];
  return (
    <nav className="h-13 bg-surface border-b border-border flex items-center px-5 gap-0 flex-shrink-0" style={{height:52}}>
      <div className="flex items-center gap-2.5 mr-8">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green to-emerald-600 flex items-center justify-center font-black text-black text-sm">◈</div>
        <span className="font-serif text-base font-bold text-text">EdgeLab</span>
        <span className="font-mono text-[9px] text-muted uppercase tracking-widest mt-0.5">Pro</span>
      </div>
      {tabs.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to}
          className={`px-5 flex items-center gap-2 font-mono text-xs border-b-2 transition-colors
            ${pathname.startsWith(to) ? 'border-green text-green font-bold' : 'border-transparent text-muted hover:text-text'}`}
          style={{height:52}}>
          <Icon size={14} />{label}
        </Link>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" style={{boxShadow:'0 0 8px #00d17a'}} />
        <span className="font-mono text-[10px] text-muted">PAPER TRADING</span>
      </div>
    </nav>
  );
}
