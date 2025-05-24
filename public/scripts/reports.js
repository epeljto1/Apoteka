document.addEventListener('DOMContentLoaded', async () => {
    const reportTypeSelect = document.getElementById('reportType');
    const reportSections = document.querySelectorAll('.report-section');

    reportTypeSelect.addEventListener('change', function () {
      const selectedValue = this.value;
    
      // Sakrij sve izvještaje
      reportSections.forEach(section => {
        section.style.display = 'none';
      });
  
      // Prikaži odgovarajući izvještaj ako je odabran
      if (selectedValue) {
        const selectedDiv = document.getElementById('report-' + selectedValue);
        if (selectedDiv) {
          selectedDiv.style.display = 'block';
          //dodano
          if (selectedValue === 'promet') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && !searchInput.dataset.bound) {
                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const filtered = reports.filter(report =>
                        report.name.toLowerCase().includes(query)
                    );
                    displayReports(filtered);
                });
                searchInput.dataset.bound = true;
            }
        }//ovdje kraj
          const btn = document.getElementById(`generateReportBtn-${selectedValue}`);
          console.log("Nađeno dugme:", btn);
          if (btn && !btn.dataset.bound) {
              console.log("Vežem event za:", btn.id);
              btn.addEventListener('click', () => handleReportGeneration(selectedValue));
              btn.dataset.bound = true; // Osiguraj da se ne veže više puta
          }
        }
      }
    });

    const reportsTableBody = document.querySelector('#reportsTable-promet tbody');
    const startDateInput = document.getElementById('startDate-promet');
    const endDateInput = document.getElementById('endDate-promet');
    const searchInput = document.getElementById('searchInput');
    const startDateContractsInput = document.getElementById('startDate-contracts');
    const endDateContractsInput = document.getElementById('endDate-contracts');
    const generateReportBtnContracts = document.getElementById('generateReportBtn-contracts');
    const reportsTableBodyContracts = document.querySelector('#reportsTable-contracts tbody');
    const reportsTableBodyDeliveries = document.querySelector('#reportsTable-deliveries tbody');
    const startDateDeliveriesInput = document.getElementById('startDate-deliveries');
    const endDateDeliveriesInput = document.getElementById('endDate-deliveries');
    const generateReportBtnDeliveries = document.getElementById('generateReportBtn-deliveries');
    let reports = [];

    async function fetchReports(startDate, endDate) {
        try {
            const response = await fetch('/api/reports/promet', {
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
            console.error('Error loading reports:', error);
        }
    }
         
    async function handleReportGeneration(type) {
        if (type === 'promet') {
            console.log("Generišem izvještaj za PROMET"); 
            const startDate = document.getElementById('startDate-promet').value;
            const endDate = document.getElementById('endDate-promet').value;
    
            try {
                const response = await fetch('/api/reports/promet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startDate, endDate })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    displayReports(data.report);
                } else {
                    alert(data.message || 'There was an error loading the report..');
                }
            } catch (err) {
                console.error('Traffic report error:', err);
                alert('Traffic report error.');
            }
        }
        
        if (type === 'contracts') {
            const startDate = document.getElementById('startDate-contracts').value;
            const endDate = document.getElementById('endDate-contracts').value;
    
            try {
                const response = await fetch('/api/reports/contracts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startDate, endDate })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    displayContractsReport(data.report);
                } else {
                    alert(data.message || 'There was an error loading the report.');
                }
            } catch (err) {
                console.error('Contracts report error:', err);
                alert('Contracts report error.');
            }
        }
        if (type === 'deliveries') {
            const startDate = document.getElementById('startDate-deliveries').value;
            const endDate = document.getElementById('endDate-deliveries').value;
            
            console.log('Start date:', startDate);
            console.log('End date:', endDate);
            try {
                const response = await fetch('/api/reports/deliveries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startDate, endDate })
                });
    
                const data = await response.json();
                console.log("Server response:", data);
    
                if (response.ok) {
                    displayDeliveriesReport(data.report);
                } else {
                    alert(data.message || 'There was an error loading the report..');
                }
            } catch (err) {
                console.error('Delivery report error:', err);
                alert('Delivery report error.');
            }
        }
        if(type === 'suppliers'){
           
           return
        }
    }
    
    function displayReports(reportsList) {
        console.log("Prikazujem raport:", reportsList); 
        reportsTableBody.innerHTML = '';
        //Tabela postaje vidljive
        document.getElementById("reportsTable-promet").style.visibility = "visible";        

        if (reportsList.length === 0) {
            reportsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">There are no results for the selected period.</td></tr>';
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
    function displayContractsReport(report) {
        reportsTableBodyContracts.innerHTML = '';
        document.getElementById("reportsTable-contracts").style.visibility = "visible";
    
        const data = [
            { label: "Total", value: report.totalContracts },
            { label: "Completed", value: report.completed },
            { label: "Failed", value: report.failed },
            { label: "Pending", value: report.pending },
            { label: "Active", value: report.active },
            { label: "Changes", value: report.changes }
        ];
    
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th>${item.label}</th>
                <td>${item.value}</td>
            `;
            reportsTableBodyContracts.appendChild(row);
        });
    }
    

    function displayDeliveriesReport(report) {
        console.log('Prikazujem izvještaj o isporukama:', report);
    
        document.getElementById("reportsTable-deliveries").style.visibility = "visible";
    
        const rows = document.querySelectorAll('#reportsTable-deliveries tbody tr');
    
        rows[0].children[1].textContent = report.totalDeliveries;
        rows[1].children[1].textContent = report.finished;
        rows[2].children[1].textContent = report.incomplete;
        rows[3].children[1].textContent = report.suspended;
        rows[4].children[1].textContent = report.active;
        rows[5].children[1].textContent = report.ukupnoUplaceno.toFixed(2);
    }
    
 
});

window.downloadPDF = function (reportType) {
    const startDate = document.getElementById(`startDate-${reportType}`).value;
    const endDate = document.getElementById(`endDate-${reportType}`).value;


    if (!startDate || !endDate) {
        alert('Please enter both dates..');
        return;
    }

    fetch(`/api/reports/${reportType}/download-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to generate PDF.');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF report.');
    });
}
