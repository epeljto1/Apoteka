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
            console.error('Error loading supplier:', error);
        }
    }

    // Funkcija za prikaz dobavljača u tabeli
    function displaySuppliers(suppliersList) {
        suppliersTableBody.innerHTML = '';

        if (suppliersList.length === 0) {
            suppliersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No suppliers found.</td></tr>';
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
        if (!confirm('Are you sure you want to delete this supplier?')) {
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
                alert('Supplier deleted successfully.');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error deleting');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Error deleting.');
        }
    };

    // Pozovi učitavanje dobavljača na početku
    fetchSuppliers();
    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const addSupplierModal = document.getElementById('addSupplierModal');
    const closeModal = document.getElementById('closeModal');
    const addSupplierForm = document.getElementById('addSupplierForm');

    // Otvaranje modala
    addSupplierBtn.addEventListener('click', () => {
        addSupplierModal.style.display = 'block';
    });

    // Zatvaranje modala
    closeModal.addEventListener('click', () => {
        addSupplierModal.style.display = 'none';
    });

    // Slanje forme
    addSupplierForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newSupplier = {
            name: document.getElementById('name').value,
            contactNumber: document.getElementById('contactNumber').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            website: document.getElementById('website').value
        };

        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSupplier)
            });

            if (response.ok) {
                const result = await response.json();
                suppliers.push(result.supplier);
                displaySuppliers(suppliers);
                addSupplierModal.style.display = 'none';
                alert('Supplier added successfully.');
                addSupplierForm.reset();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error adding.');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            alert('Error adding.');
        }
    });
});