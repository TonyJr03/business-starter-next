export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  /** Sub-items para dropdown. Si está presente, `href` se usa como toggle (no navega). */
  children?: NavItem[];
}

export interface FooterSection {
  title: string;
  links: NavItem[];
}
