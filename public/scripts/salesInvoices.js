let globalInvoices = [];
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/salesInvoices');
    const data = await response.json();
    globalInvoices = data.invoices;

    if (response.ok) {
        const invoicesContainer = document.getElementById('invoicesContainer');
        
        data.invoices.forEach(invoice => {
            const items = invoice.SalesInvoiceItems;

            const date = new Date(invoice.issueDate);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            const tableRows = items.map(item => `
                <tr>
                    <td>${item.Product.name}</td>
                    <td>${item.Product.price.toFixed(2)} KM</td>
                    <td>${item.quantity}</td>
                    <td>${(item.quantity * item.Product.price).toFixed(2)} KM</td>
                </tr>
            `).join('');

            invoicesContainer.innerHTML += `
                <div class="invoice">
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
                    <button class="printInvoice" data-invoice-id="${invoice.id}">Print Invoice</button>
                </div>
            `;
        });

        document.querySelectorAll('.printInvoice').forEach(button => {
            button.addEventListener('click', async (e) => {
                const invoiceId = e.target.getAttribute('data-invoice-id');
                const invoice = data.invoices.find(inv => inv.id === invoiceId);
                printInvoice(invoice);
            });
        });

    } else {
        alert(data.message || 'Failed to retrieve invoices.');
    }
});

document.getElementById('downloadAllInvoices').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    globalInvoices.forEach((invoice, index) => {
        const date = new Date(invoice.issueDate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        doc.setFontSize(14);
        doc.text(`Invoice #${invoice.id}`, 14, y);
        y += 6;
        doc.setFontSize(12);
        doc.text(`Release Date: ${formattedDate}`, 14, y);
        y += 10;

        doc.autoTable({
            startY: y,
            head: [['Medication', 'Price (KM)', 'Quantity', 'Total (KM)']],
            body: invoice.SalesInvoiceItems.map(item => [
                item.Product.name,
                item.Product.price.toFixed(2),
                item.quantity,
                (item.quantity * item.Product.price).toFixed(2)
            ]),
            theme: 'striped',
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } }
        });

        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Amount: ${invoice.totalAmount.toFixed(2)} KM`, 14, y);
        y += 20;

        // Ako smo blizu kraja stranice, dodaj novu stranicu
        if (y > 260 && index !== globalInvoices.length - 1) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save('all_invoices.pdf');
});