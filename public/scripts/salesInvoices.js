document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/salesInvoices');
    const data = await response.json();

    if (response.ok) {
        const invoicesContainer = document.getElementById('invoicesContainer');
        
        data.invoices.forEach(invoice => {
            const items = invoice.SalesInvoiceItems;

            const date = new Date(invoice.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            const tableRows = items.map(item => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.product.price.toFixed(2)} KM</td>
                    <td>${item.quantity}</td>
                    <td>${(item.quantity * item.product.price).toFixed(2)} KM</td>
                </tr>
            `).join('');

            invoicesContainer.innerHTML += `
                <div class="invoice">
                    <h3>Faktura #${invoice.id}</h3>
                    <div class="invoice-header">
                        <h4>Apoteke Sarajevo</h4>
                        <p>Datum izdavanja: ${formattedDate}</p>
                    </div>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Lijek</th>
                                <th>Cijena (KM)</th>
                                <th>Količina</th>
                                <th>Ukupno (KM)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <p class="total-amount">Ukupan iznos: <strong>${invoice.totalAmount.toFixed(2)} KM</strong></p>
                    <button class="printInvoice" data-invoice-id="${invoice.id}">Printaj fakturu</button>
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
        alert(data.message || 'Greška pri dohvaćanju faktura.');
    }
});

function printInvoice(invoice) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const items = invoice.SalesInvoiceItems;

    const date = new Date(invoice.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    doc.setFontSize(16);
    doc.text("Apoteke Sarajevo", 14, 22);
    doc.setFontSize(12);
    doc.text(`Datum izdavanja: ${formattedDate}`, 14, 30);

    let y = 40;
    doc.autoTable({
        startY: y,
        head: [['Lijek', 'Cijena (KM)', 'Količina', 'Ukupno (KM)']],
        body: items.map(item => [
            item.product.name,
            item.product.price.toFixed(2),
            item.quantity,
            (item.quantity * item.product.price).toFixed(2)
        ]),
        theme: 'striped',
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 10;
    doc.text(`Ukupan iznos: ${invoice.totalAmount.toFixed(2)} KM`, 14, y);

    doc.save(`faktura_${invoice.id}.pdf`);
}