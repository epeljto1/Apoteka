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

        const { supplier } = await response.json();

        document.getElementById('supplierDetails').innerHTML = `
            <form id="updateSupplierForm">
                <label>Name:</label><input name="name" value="${supplier.name}" required><br>
                <label>Contact number:</label><input name="contactNumber" value="${supplier.contactNumber}" required><br>
                <label>Email:</label><input name="email" value="${supplier.email}" required><br>
                <label>Address:</label><input name="address" value="${supplier.address}" required><br>
                <label>Website:</label><input name="website" value="${supplier.website}" required><br>
                <button type="submit">Update</button>
            </form>
            <div id="toast" style="display:none; background: #4CAF50; color:white; padding:10px; margin-top:10px; border-radius:5px;">Uspješno ažurirano!</div>
        `;

        document.getElementById('updateSupplierForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const body = {};
            formData.forEach((value, key) => body[key] = value);

            const updateResponse = await fetch(`/api/suppliers/${supplierId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (updateResponse.ok) {
                showToast();
            } else {
                alert('Greška pri ažuriranju.');
            }
        });

    } catch (error) {
        console.error('Greška:', error);
        document.getElementById('supplierDetails').innerHTML = '<p>Greška pri učitavanju podataka.</p>';
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}