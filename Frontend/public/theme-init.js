(function () {
  try {
    var theme = localStorage.getItem('nx.theme');
    if (!theme) {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    // Swallow errors to avoid blocking initial render if storage access fails
  }
})();
