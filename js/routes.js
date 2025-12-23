async function loadRoutes() {
    const response = await fetch('https://jaceyy009.github.io/service-alerts/routes.csv');
    const csv = await response.text();
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const routes = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
        }, {});
    });

    // Sort by route_id or something; here assuming ascending
    routes.sort((a, b) => a.route_id.localeCompare(b.route_id));

    const tbody = document.querySelector('#routes-table tbody');
    routes.forEach(route => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = route[header];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

loadRoutes();
