// Script to reset theme to light mode
if (typeof window !== 'undefined') {
  localStorage.removeItem('sistema-votacion-theme');
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  console.log('Theme reset to light mode');
}