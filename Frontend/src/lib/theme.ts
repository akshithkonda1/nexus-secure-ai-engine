export function setTheme(mode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

export function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}
