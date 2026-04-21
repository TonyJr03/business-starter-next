import type { NavItem, FooterSection } from '@/types';
import { globalConfig } from './business-config';

// La navegación se construye 100% desde `modules.pages`.
// Home se prepend fijo; el resto sigue el orden de declaración de pageModules.
const { pages } = globalConfig.modules;

const pageNavItems: NavItem[] = Object.values(pages)
  .filter((mod) => mod.enabled)
  .map((mod) => ({ label: mod.navLabel, href: mod.path }));

export const headerNav: NavItem[] = [
  { label: 'Inicio', href: '/' },
  ...pageNavItems,
];

export const footerNav: FooterSection[] = [
  {
    title: 'Navegación',
    links: headerNav,
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Términos',   href: '/terminos'   },
    ],
  },
];
