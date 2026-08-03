(async () => {
    try {
        const response = await fetch('/apps');
        if (!response.ok) throw new Error('Server failed to load apps');
        const data = await response.json();

        const grid = document.getElementById('gameGrid');
        if (!Array.isArray(data)) return;

        grid.innerHTML = data.map(name => 
            `<a href="/apps/${name}" class="app-link">${name}</a>`
        ).join(' ');
    } catch (err) {
        console.error('Failed to populate apps:', err);
        const grid = document.getElementById('gameGrid');
        if (grid) grid.textContent = 'No apps found';
    }
})();
