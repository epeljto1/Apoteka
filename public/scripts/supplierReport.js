document.getElementById('generateReportBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/suppliers/report', {
        method: 'GET'
      });
  
      if (!response.ok) {
        throw new Error('Error generating report.');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report-suppliers.pdf';
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
    console.error('Error retrieving data:', error);
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
      <th>Name</th>
      <th>Address</th>
      <th>Contracts</th>
      <th>Active</th>
      <th>On Hold</th>
      <th>Completed</th>
      <th>Terminated</th>
      <th>Successful Deliveries</th>
      <th>Unsuccessful Deliveries</th>
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
      <td>${s.active}</td>
      <td>${s.pending}</td>
      <td>${s.completed}</td>
      <td>${s.failed}</td>
      <td>${s.uspjesneIsporuke}</td>
      <td>${s.neuspjesneIsporuke}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}