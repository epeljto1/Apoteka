document.getElementById('generateReportBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/suppliers/report', {
        method: 'GET'
      });
  
      if (!response.ok) {
        throw new Error('Greška pri generisanju izvještaja');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'izvjestaj-dobavljaci.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('showTableBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('api/suppliers/report?format=json');
    const data = await response.json();
    renderTable(data);
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka:', error);
  }
});

function renderTable(suppliers) {
  const container = document.getElementById('reportTableContainer');
  container.innerHTML = ''; // Clear previous content

  const table = document.createElement('table');
  table.classList.add('report-table'); // Optional: style this in CSS

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Rbr</th>
      <th>Naziv</th>
      <th>Adresa</th>
      <th>Ugovori</th>
      <th>Aktivni</th>
      <th>Neaktivni</th>
      <th>Uspješno okončani</th>
      <th>Neuspješno okončani</th>
      <th>Uspješne isporuke</th>
      <th>Neuspješne isporuke</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  suppliers.forEach((s, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${s.name}</td>
      <td>${s.address}</td>
      <td>${s.contractCount}</td>
      <td>${s.aktivan}</td>
      <td>${s.neaktivan}</td>
      <td>${s.uspjesnoOkoncan}</td>
      <td>${s.neuspjesnoOkoncan}</td>
      <td>${s.uspjesneIsporuke}</td>
      <td>${s.neuspjesneIsporuke}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}