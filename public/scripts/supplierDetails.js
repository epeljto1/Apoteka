document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const supplierId = params.get('id');

    if (!supplierId) {
        document.getElementById('supplierDetails').innerHTML = '<p>Supplier not found.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`);
        if (!response.ok) throw new Error('Error retrieving supplier.');

        const data = await response.json();
        const supplier = data.supplier;

        document.getElementById('supplierDetails').innerHTML = `
            <h2>${supplier.name}</h2>
            <p><strong>Contact number:</strong> ${supplier.contactNumber}</p>
            <p><strong>Email:</strong> ${supplier.email}</p>
            <p><strong>Address:</strong> ${supplier.address}</p>
            <p><strong>Website:</strong> <a href="${supplier.website}" target="_blank">${supplier.website}</a></p>
        `;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('supplierDetails').innerHTML = '<p>Error loading data.</p>';
    }
});