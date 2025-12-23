async function loadAlerts() {
    const response = await fetch('/alerts.csv');
    const csv = await response.text();
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const alerts = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
        }, {});
    });

    // Sort by effective_date descending
    alerts.sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));

    // Unique routes for filter
    const allRoutes = alerts.flatMap(alert => alert.routes.split(',').map(r => r.trim()));
    const uniqueRoutes = [...new Set(allRoutes)].sort();
    const routeFilter = document.getElementById('route-filter');
    uniqueRoutes.forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        routeFilter.appendChild(option);
    });

    // Filters
    const severityFilter = document.getElementById('severity-filter');
    routeFilter.addEventListener('change', renderTable);
    severityFilter.addEventListener('change', renderTable);

    function renderTable() {
        const selectedRoute = routeFilter.value;
        const selectedSeverity = severityFilter.value;
        const tbody = document.querySelector('#alerts-table tbody');
        tbody.innerHTML = '';

        const filteredAlerts = alerts.filter(alert => {
            const routeMatch = !selectedRoute || alert.routes.split(',').map(r => r.trim()).includes(selectedRoute);
            const severityMatch = !selectedSeverity || alert.severity === selectedSeverity;
            return routeMatch && severityMatch;
        });

        filteredAlerts.forEach(alert => {
            const row = document.createElement('tr');
            row.classList.add(alert.severity.toLowerCase());

            headers.forEach(header => {
                const td = document.createElement('td');
                if (header === 'published_by' || header === 'approved_by') {
                    const a = document.createElement('a');
                    a.href = `/users/${alert[header]}.html`;
                    a.textContent = alert[header];
                    td.appendChild(a);
                } else if (header === 'description' && alert.image_url) {
                    td.textContent = alert.description;
                    const img = document.createElement('img');
                    img.src = alert.image_url;
                    img.alt = 'Alert Image';
                    img.classList.add('alert-image');
                    td.appendChild(img);
                } else {
                    td.textContent = alert[header];
                }
                row.appendChild(td);
            });

            // Status column for "New"
            const statusTd = document.createElement('td');
            const createdDate = new Date(alert.created_at);
            const now = new Date();
            if ((now - createdDate) / (1000 * 60 * 60) < 24) {
                statusTd.textContent = 'New';
                statusTd.classList.add('new');
            }
            row.appendChild(statusTd);

            tbody.appendChild(row);
        });
    }

    renderTable();
}

loadAlerts();
