document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const suppliersTableBody = document.querySelector('#suppliersTable tbody');

    let suppliers = [];

    // Funkcija za učitavanje svih dobavljača
    async function fetchSuppliers() {
        try {
            const response = await fetch('/api/suppliers');
            const data = await response.json();
            suppliers = data.suppliers;
            displaySuppliers(suppliers);
        } catch (error) {
            console.error('Greška pri učitavanju dobavljača:', error);
        }
    }

    // Funkcija za prikaz dobavljača u tabeli
    function displaySuppliers(suppliersList) {
        suppliersTableBody.innerHTML = '';

        if (suppliersList.length === 0) {
            suppliersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nema dobavljača.</td></tr>';
            return;
        }

        suppliersList.forEach(supplier => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${supplier.name}</td>
                <td>${supplier.contactNumber}</td>
                <td><button onclick="viewSupplier(${supplier.id})">ℹ️</button></td>
                <td><button onclick="deleteSupplier(${supplier.id})">❌</button></td>
            `;

            suppliersTableBody.appendChild(tr);
        });
    }

    // Funkcija za pretragu
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(query)
        );
        displaySuppliers(filtered);
    });

    // Funkcija za prikaz detalja (prelazak na supplierDetails.html)
    window.viewSupplier = function (supplierId) {
        window.location.href = `/supplierdetails?id=${supplierId}`;
    };

    // Funkcija za brisanje dobavljača
    window.deleteSupplier = async function (supplierId) {
        if (!confirm('Da li ste sigurni da želite obrisati ovog dobavljača?')) {
            return;
        }

        try {
            const response = await fetch(`/api/suppliers/${supplierId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Uspješno obrisano - osvježi prikaz
                suppliers = suppliers.filter(s => s.id !== supplierId);
                displaySuppliers(suppliers);
                alert('Dobavljač uspješno obrisan.');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Greška pri brisanju.');
            }
        } catch (error) {
            console.error('Greška pri brisanju dobavljača:', error);
            alert('Greška pri brisanju.');
        }
    };

    // Pozovi učitavanje dobavljača na početku
    fetchSuppliers();
});