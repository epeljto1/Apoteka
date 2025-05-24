document.addEventListener('DOMContentLoaded', () => {
  const contractTypeSelect = document.getElementById('contractType');
  const tableBody = document.querySelector('#quickContractsTable tbody');
  const generateBtn = document.getElementById('generateReportBtn');

  contractTypeSelect.addEventListener('change', async () => {
    const contractType = contractTypeSelect.value;
    tableBody.innerHTML = ''; // očisti tabelu

    if (contractType === 'expiring') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const expirationDateTo = thirtyDaysFromNow.toISOString().split('T')[0]; // yyyy-mm-dd

      try {
        const response = await fetch(`api/products?expirationDateTo=${expirationDateTo}`);
        const data = await response.json();

        if (!Array.isArray(data.products)) {
          alert('Error loading product.');
          return;
        }

        const productNames = data.products.map(product => product.name);
        const supplierData = await fetchSupplierInfo(productNames);

        data.products.forEach(product => {
          const row = document.createElement('tr');
          const info = supplierData[product.name] || { suppliers: [], latestCost: 0 };

          const supplierOptions = info.suppliers.length > 0
            ? info.suppliers.map(supplier => `<option value="${supplier}">${supplier}</option>`).join('')
            : `<option value="">-- No suppliers found --</option>`;

          row.innerHTML = `
            <td>${product.name}</td>
            <td>
              <select class ="supplierSelectOption">
                <option value="">-- Choose --</option>
                ${supplierOptions}
              </select>
            </td>

            <td>${product.quantity}</td>
            <td>${product.price.toFixed(2)} KM</td>

            <td><input class="inputsFields" type="number" value="0" min="0" /></td>
            <td><input class="inputsFields" type="number" value="${info.latestCost}" min="0" step="0.01" /></td>
            <td><input type="checkbox" /></td>
          `;

          tableBody.appendChild(row);
        });

      } catch (error) {
        console.error('Error:', error);
        alert('Error communicating with the server.');
      }
    }
    else if (contractType === 'bestsellers') {
        try {
            const response = await fetch('/api/products/bestsellers');
            const data = await response.json();

            if (!Array.isArray(data.products)) {
            alert('Error loading top selling products.');
            return;
            }

            const productNames = data.products.map(p => p.name);
            const supplierData = await fetchSupplierInfo(productNames);

            data.products.forEach(product => {
            const row = document.createElement('tr');
            const info = supplierData[product.name] || { suppliers: [], latestCost: 0 };

            const supplierOptions = info.suppliers.length > 0
                ? info.suppliers.map(supplier => `<option value="${supplier}">${supplier}</option>`).join('')
                : `<option value="">-- No suppliers found --</option>`;

            row.innerHTML = `
                <td>${product.name}</td>
                <td>
                <select class ="supplierSelectOption">
                    <option value="">-- Choose --</option>
                    ${supplierOptions}
                </select>
                </td>
                <td>${product.quantity}</td>
                <td>${product.price.toFixed(2)} KM</td>
                <td><input class="inputsFields" type="number" value="0" min="0" /></td>
                <td><input class="inputsFields" type="number" value="${info.latestCost}" min="0" step="0.01" /></td>
                <td><input type="checkbox" /></td>
            `;
            tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error loading bestsellers:', error);
            alert('Error communicating with the server.');
        }
        } 
    else {
      tableBody.innerHTML = '';
    }
  });

  generateBtn.addEventListener('click', async () => {
    const rows = tableBody.querySelectorAll('tr');
    const selectedItemsBySupplier = {};

    for (const row of rows) {
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (!checkbox.checked) continue;

      const productName = row.cells[0].textContent.trim();
      const supplierName = row.querySelector('select').value;
      const quantity = parseInt(row.querySelector('input[type="number"]').value, 10);
      const cost = parseFloat(row.cells[5].querySelector('input').value);

      if (!supplierName || quantity <= 0 || isNaN(cost)) continue;

      if (!selectedItemsBySupplier[supplierName]) {
        selectedItemsBySupplier[supplierName] = [];
      }

      selectedItemsBySupplier[supplierName].push({
        productName,
        quantity,
        cost
      });
    }

    if (Object.keys(selectedItemsBySupplier).length === 0) {
      alert('You have not selected any product with correct information.');
      return;
    }

    try {
      // Dohvati sve dobavljače da mapiraš ime u ID
      const suppliersResp = await fetch('/api/suppliers');
      const { suppliers: suppliersData = [] } = await suppliersResp.json();
      const supplierMap = {};
      suppliersData.forEach(s => supplierMap[s.name] = s.id);

      // Postavi datume
      const today = new Date();
      const conclusionDate = today.toISOString().split('T')[0];
      const expirationDateObj = new Date(today);
      expirationDateObj.setDate(today.getDate() + 30);
      const expirationDate = expirationDateObj.toISOString().split('T')[0];

      for (const [supplierName, items] of Object.entries(selectedItemsBySupplier)) {
        const supplierId = supplierMap[supplierName];
        if (!supplierId) {
          alert(`Supplier Unknown: ${supplierName}`);
          continue;
        }

        const payload = {
          subject: "Quick Contract",
          conclusionDate,
          expirationDate,
          conditions: "",
          status: "Active",
          supplierId,
          deliveryDate: expirationDate,
          deliveryStatus: "Active",
          items
        };

        const resp = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          console.error(`Error for supplier ${supplierName}`);
        }
      }

      showToast('Contracts formed successfully.');
      setTimeout(() => location.reload(), 3200);

    } catch (err) {
      console.error('Error creating contract:', err);
      alert('Error creating contract.');
    }
  });
});

async function fetchSupplierInfo(productNames) {
  try {
    const response = await fetch('api/products/supplier-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productNames })
    });

    if (!response.ok) throw new Error('Error loading supplier data.');

    return await response.json();
  } catch (error) {
    console.error('Error in fetchSupplierInfo:', error);
    return {};
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300); // čekaj da završi fade-out
  }, 3000);
}