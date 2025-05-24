document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const supplierId = params.get('id');

    if (!supplierId) {
        document.getElementById('supplierDetails').innerHTML = '<p>Dobavljač nije pronađen.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`);
        if (!response.ok) throw new Error('Error loading supplier.');

        const { supplier } = await response.json();

        document.getElementById('supplierDetails').innerHTML = `
            <form id="updateSupplierForm">
                <label>Name:</label><input name="name" value="${supplier.name}" required>
                <label>Contact number:</label><input name="contactNumber" value="${supplier.contactNumber}" required>
                <label>Email:</label><input name="email" value="${supplier.email}" required>
                <label>Address:</label><input name="address" value="${supplier.address}" required>
                <label>Website:</label><input name="website" value="${supplier.website}" required><br>
                <button type="submit">Update</button>
            </form>
            <div id="toast" style="display:none; background: #4CAF50; color:white; padding:10px; margin-top:10px; border-radius:5px;">Successfully updated!</div>
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
                alert('Update error.');
            }
        });

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('supplierDetails').innerHTML = '<p>Error loading data.</p>';
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}