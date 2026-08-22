// Loads themes for the master page only.

(function () {
  'use strict';

  const savedTheme = localStorage.getItem('flatgames-theme');
  let availableThemes = [];
  let currentTheme = savedTheme || 'default';
  let themeSelector;
  let themeButton;
  let themeNameElement;
  let themeOptions;

  function init() {
    themeSelector = document.getElementById('themeSelector');
    themeButton = themeSelector ? themeSelector.querySelector('.theme-button') : null;
    themeNameElement = document.getElementById('themeName');
    themeOptions = document.getElementById('themeOptions');

    if (!themeSelector || !themeButton || !themeNameElement || !themeOptions) {
      return;
    }

    addThemeSelectorStyles();
    setupEventListeners();
    loadThemes();
  }

  function addThemeSelectorStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .theme-selector { position: fixed; top: 20px; right: 20px; z-index: 1000; }
      .theme-button { display: flex; align-items: center; gap: 8px; padding: 10px 16px; }
      .theme-options { display: none; flex-direction: column; }
      .theme-options.visible { display: flex; }
      .theme-option { padding: 10px 16px; cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  async function loadThemes() {
    try {
      const response = await fetch('/themes', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Theme list request failed: ${response.status}`);
      }

      const themes = await response.json();
      availableThemes = themes
        .filter(theme => /^[a-zA-Z0-9_-]+$/.test(theme))
        .sort((first, second) => first.localeCompare(second));
    } catch (error) {
      console.error('Failed to load themes:', error);
      availableThemes = ['default'];
    }

    if (!availableThemes.includes(currentTheme)) {
      currentTheme = availableThemes.includes('default') ? 'default' : availableThemes[0];
    }

    renderThemeDropdown();
    applyTheme(currentTheme);
  }

  function renderThemeDropdown() {
    themeOptions.replaceChildren();

    availableThemes.forEach(theme => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'theme-option';
      option.dataset.theme = theme;
      option.textContent = formatThemeName(theme);
      option.setAttribute('aria-selected', String(theme === currentTheme));
      themeOptions.appendChild(option);
    });

    updateActiveOption();
  }

  function applyTheme(selectedTheme) {
    if (!availableThemes.includes(selectedTheme)) {
      return;
    }

    currentTheme = selectedTheme;
    localStorage.setItem('flatgames-theme', selectedTheme);
    themeNameElement.textContent = formatThemeName(selectedTheme);

    const oldThemeLink = document.getElementById('active-theme');
    if (oldThemeLink) {
      oldThemeLink.remove();
    }

    const themeLink = document.createElement('link');
    themeLink.id = 'active-theme';
    themeLink.rel = 'stylesheet';
    themeLink.href = `/themes/${encodeURIComponent(selectedTheme)}.css`;
    document.head.appendChild(themeLink);
    updateActiveOption();
  }

  function updateActiveOption() {
    themeOptions.querySelectorAll('.theme-option').forEach(option => {
      const isActive = option.dataset.theme === currentTheme;
      option.classList.toggle('active', isActive);
      option.setAttribute('aria-selected', String(isActive));
    });
  }

  function setDropdownOpen(isOpen) {
    themeOptions.classList.toggle('visible', isOpen);
    themeButton.setAttribute('aria-expanded', String(isOpen));
  }

  function setupEventListeners() {
    themeButton.addEventListener('click', event => {
      event.stopPropagation();
      setDropdownOpen(!themeOptions.classList.contains('visible'));
    });

    themeOptions.addEventListener('click', event => {
      const option = event.target.closest('.theme-option');
      if (!option) {
        return;
      }

      applyTheme(option.dataset.theme);
      setDropdownOpen(false);
    });

    document.addEventListener('click', event => {
      if (!themeSelector.contains(event.target)) {
        setDropdownOpen(false);
      }
    });

    themeButton.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setDropdownOpen(true);
        themeOptions.querySelector('.theme-option')?.focus();
      }
    });

    themeOptions.addEventListener('keydown', event => {
      const options = [...themeOptions.querySelectorAll('.theme-option')];
      const focusedIndex = options.indexOf(document.activeElement);

      if (event.key === 'Escape') {
        setDropdownOpen(false);
        themeButton.focus();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (focusedIndex + direction + options.length) % options.length;
        options[nextIndex]?.focus();
      }
    });
  }

  function formatThemeName(theme) {
    return theme
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
