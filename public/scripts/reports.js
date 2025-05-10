document.addEventListener('DOMContentLoaded', async () => {
    const reportsTableBody = document.querySelector('#reportsTable tbody');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const searchInput = document.getElementById('searchInput');

    let reports = [];

    async function fetchReports(startDate, endDate) {
        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ startDate, endDate })
            });

            const data = await response.json();
            reports = data.report;
            displayReports(reports);
        } catch (error) {
            console.error('Greška pri učitavanju izvještaja:', error);
        }
    }
         
    function displayReports(reportsList) {
        reportsTableBody.innerHTML = '';

        if (reportsList.length === 0) {
            reportsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nema rezultata za odabrani period.</td></tr>';
            return;
        }

        reportsList.forEach(report => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${report.name}</td>
                <td>${report.manufacturer}</td>
                <td>${report.price.toFixed(2)} KM</td>
                <td>${report.totalSold}</td>
                <td>${report.totalEarnings.toFixed(2)} KM</td>
            `;
            reportsTableBody.appendChild(tr);
        });
    }

    generateReportBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Unesite oba datuma.');
            return;
        }

        fetchReports(startDate, endDate);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = reports.filter(report =>
            report.name.toLowerCase().includes(query)
        );
        displayReports(filtered);
    });
});

window.downloadPDF = function () {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Molimo unesite oba datuma.');
        return;
    }

    fetch('/api/reports/download-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Neuspješno generisanje PDF-a.');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'izvjestaj.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Greška pri preuzimanju PDF-a:', error);
        alert('Greška pri preuzimanju PDF izvještaja.');
    });
}
