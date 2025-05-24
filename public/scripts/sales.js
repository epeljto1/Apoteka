document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    const products = data.products;
    const today = new Date();

    let cart = [];

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const cartContainer = document.getElementById('cartContainer');

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const formattedDate = formatDate(today);

    function updateSearchResults() {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        searchResults.innerHTML = '<p>No results.</p>';
        return;
    }

    filtered.forEach(product => {
        const isOutOfStock = product.quantity <= 0;
        const isExpired = new Date(product.expirationDate) <= today;

        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.padding = '10px';
        div.style.marginBottom = '8px';
        div.style.borderRadius = '5px';
        div.style.backgroundColor = (isOutOfStock || isExpired) ? '#f0f0f0' : '#ffffff';
        div.style.color = (isOutOfStock || isExpired) ? '#888' : '#000';

        let statusText = '';
        if (isOutOfStock) statusText = '<span style="color:red;">Out of stock</span>';
        else if (isExpired) statusText = `<span style="color:red;">Expired: ${formatDate(new Date(product.expirationDate))}</span>`;

        div.innerHTML = `
            <strong>${product.name}</strong> ${product.price} KM (Available: ${product.quantity})<br>
            ${statusText || `
                <input type="number" min="1" max="${product.quantity}" value="1" id="qty_${product.id}" style="width:60px;">
                <button type="button" onclick="addToCart(${product.id})">Add</button>
            `}
        `;
        searchResults.appendChild(div);
    });
}

    window.addToCart = function (productId) {
        const product = products.find(p => p.id === productId);
        const qtyInput = document.getElementById(`qty_${productId}`);
        const quantity = parseInt(qtyInput.value);

        if (!quantity || quantity < 1) return;

        const existing = cart.find(item => item.product.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }

        updateCart();
    };

    function updateCart() {
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Cart is empty.</p>';
            return;
        }

        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                ${item.product.name}  ${item.quantity} x ${item.product.price.toFixed(2)} KM =
                ${(item.quantity * item.product.price).toFixed(2)} KM
                <button onclick="removeFromCart(${index})">Remove</button>
            `;
            cartContainer.appendChild(div);
        });
    }

    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCart();
    };

    searchInput.addEventListener('input', updateSearchResults);

    document.getElementById('salesForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const items = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }));

        if (items.length === 0) {
            alert('The cart is empty. Add at least one medication.');
            return;
        }

        const response = await fetch('/api/sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });

        const result = await response.json();
        if (response.ok) {
            const invoice = result.invoice;
            const items = invoice.items;

            const tableRows = items.map(item => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.product.price.toFixed(2)} KM</td>
                    <td>${item.quantity}</td>
                    <td>${(item.quantity * item.product.price).toFixed(2)} KM</td>
                </tr>
            `).join('');

            document.getElementById('invoiceResult').innerHTML = `
                <h3>Invoice #${invoice.id}</h3>
                <div class="invoice-header">
                    <h4>Pharmacy Health</h4>
                    <p>Release Date: ${formattedDate}</p>
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Medication</th>
                            <th>Price (KM)</th>
                            <th>Quantity</th>
                            <th>Total (KM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <p class="total-amount">Total Amount: <strong>${invoice.totalAmount.toFixed(2)} KM</strong></p>
                <button id="printInvoice">Print Invoice</button>
            `;

            document.getElementById('printInvoice').addEventListener('click', () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                doc.setFontSize(16);
                doc.text("Pharmacy Health", 14, 22);
                doc.setFontSize(12);
                doc.text(`Datum izdavanja: ${formattedDate}`, 14, 30);

                let y = 40;
                doc.autoTable({
                    startY: y,
                    head: [['Medication', 'Price (KM)', 'Quantity', 'Total (KM)']],
                    body: items.map(item => [
                        item.product.name,
                        item.product.price.toFixed(2),
                        item.quantity,
                        (item.quantity * item.product.price).toFixed(2)
                    ]),
                    theme: 'striped',
                    columnStyles: {
                        0: { halign: 'left' },
                        1: { halign: 'center' },
                        2: { halign: 'center' },
                        3: { halign: 'right' }
                    }
                });

                y = doc.lastAutoTable.finalY + 10;
                doc.text(`Total Amount: ${invoice.totalAmount.toFixed(2)} KM`, 14, y);
                doc.save(`invoice_${invoice.id}.pdf`);
                document.getElementById('invoiceResult').innerHTML = '';
            });

            // Reset
            cart = [];
            updateCart();
            searchInput.value = '';
            searchResults.innerHTML = '';
        } else {
            alert(result.message || 'Error processing sale.');
        }
    });
});
