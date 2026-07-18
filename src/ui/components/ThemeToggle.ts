import { h } from '@/ui/dom';
import './ThemeToggle.css';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'irs-theme';

/**
 * Reads the theme currently applied to <html>. The initial value is set by the
 * inline anti-flash script in index.html, so this is always defined by the time
 * the component mounts.
 */
function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Applies a theme to <html> and persists the choice (best-effort). */
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Persistence is a convenience (private mode / disabled storage): ignore.
  }
}

/**
 * Single-button light/dark switch. Shows a moon in light mode (click → dark)
 * and a sun in dark mode (click → light), mirroring the OS convention. The
 * label is announced to assistive tech via `aria-label`; `aria-pressed`
 * reflects whether dark mode is active.
 */
export function ThemeToggle(): HTMLElement {
  const btn = h('button', {
    class: 'theme-toggle',
    type: 'button',
    'aria-label': 'Alternar entre modo claro e escuro',
    title: 'Alternar modo claro / escuro',
  });

  function render(theme: Theme): void {
    const dark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.textContent = dark ? '☀' : '☾';
  }

  render(currentTheme());

  btn.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    render(next);
  });

  return btn;
}
