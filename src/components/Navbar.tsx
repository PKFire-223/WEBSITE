import React, { useState, useEffect } from 'react';
import { Flame, Mail, Menu, X, ArrowUpRight, Terminal } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { USER_INFO } from '../data/portfolioData';

interface NavbarProps {
  onOpenTerminal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'PK Fire Lab', href: '#pkfire-lab', badge: 'Interactive' },
    { label: 'Experience', href: '#experience' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-colors"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[1px] shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all">
              <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 leading-none font-extrabold text-neutral-100">
                {USER_INFO.name}
                <span className="text-amber-500 text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  223
                </span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono mt-0.5 tracking-wider uppercase">
                Software Engineer
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/60 border border-neutral-800/80 rounded-full px-4 py-1.5 backdrop-blur-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-3 py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors rounded-full hover:bg-neutral-800/60 flex items-center gap-1.5"
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono font-semibold">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                title="Open Interactive Shell"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>CLI</span>
              </button>
            )}

            <a
              href={USER_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-lg shadow-sm shadow-orange-500/20 transition-all font-mono"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Get in touch</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={USER_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-xl px-4 pt-3 pb-6 mt-3 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-900 text-sm font-medium"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2">
            <a
              href={USER_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-neutral-300 bg-neutral-900 rounded-lg border border-neutral-800 font-mono"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub / PKFire-223</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg font-mono"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Me</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
