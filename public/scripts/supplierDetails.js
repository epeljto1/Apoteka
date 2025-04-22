document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const supplierId = params.get('id');

    if (!supplierId) {
        document.getElementById('supplierDetails').innerHTML = '<p>Dobavljač nije pronađen.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`);
        if (!response.ok) throw new Error('Greška pri dohvatu dobavljača.');

        const data = await response.json();
        const supplier = data.supplier;

        document.getElementById('supplierDetails').innerHTML = `
            <h2>${supplier.name}</h2>
            <p><strong>Kontakt broj:</strong> ${supplier.contactNumber}</p>
            <p><strong>Email:</strong> ${supplier.email}</p>
            <p><strong>Adresa:</strong> ${supplier.address}</p>
            <p><strong>Web stranica:</strong> <a href="${supplier.website}" target="_blank">${supplier.website}</a></p>
        `;
    } catch (error) {
        console.error('Greška:', error);
        document.getElementById('supplierDetails').innerHTML = '<p>Greška pri učitavanju podataka.</p>';
    }
});