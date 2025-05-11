const express = require('express');
const router = express.Router();
const path = require('path');
const PDFDocument = require('pdfkit');
const { Contract, Supplier, Delivery, Invoice, InvoiceItems } = require('../models');


// Dohvati sve ugovore sa dobavljačima
router.get('/contracts', async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            include: [{ model: Supplier }]
        });
        res.json(contracts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Greška pri dohvaćanju ugovora');
    }
});


router.get('/contracts/:id/pdf', async (req, res) => {
    const contractId = req.params.id;

    // Pronađi ugovor sa dobavljačem
    const contract = await Contract.findByPk(contractId, {
        include: [{ model: Supplier }]
    });

    if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
    }

    // Pronađi sve dostave s fakturama i stavkama
    const deliveries = await Delivery.findAll({
        where: { contractId },
        include: {
            model: Invoice,
            include: InvoiceItems
        }
    });

    // Kreiranje PDF-a
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.pdf`);
        res.end(pdfData);
    });

    // Naslov i osnovni podaci
    doc.image(path.join(__dirname, '../../public/pictures/logo.png'), 50, 45, { width: 50 });
    doc.fontSize(20).text('Contract', 110, 57).moveDown();
    doc.fontSize(12);
    
    const fields = [
        { label: 'Contract ID', value: contract.id },
        { label: 'Subject', value: contract.subject },
        { label: 'Conclusion Date', value: new Date(contract.conclusionDate).toLocaleDateString() },
        { label: 'Expiration Date', value: new Date(contract.expirationDate).toLocaleDateString() },
        { label: 'Status', value: contract.status },
        { label: 'Supplier Name', value: contract.Supplier.name },
        { label: 'Supplier Email', value: contract.Supplier.email }
    ];

    fields.forEach(field => {
        doc.font('Helvetica-Bold').text(`${field.label}: `, { continued: true });
        doc.font('Helvetica').text(field.value);
    });

    // Dodaj proizvode ako ih ima
    let hasProducts = false;
    deliveries.forEach((delivery, idx) => {
        const invoice = delivery.Invoice;
        if (invoice && invoice.InvoiceItems && invoice.InvoiceItems.length > 0) {
            if (!hasProducts) {
                doc.addPage().fontSize(16).text("Products", { underline: true }).moveDown();
                hasProducts = true;
            }

            doc.fontSize(14).text(`Delivery #${idx + 1} (${new Date(delivery.deliveryDate).toLocaleDateString()}):`);
            invoice.InvoiceItems.forEach(item => {
                doc.fontSize(12).list([
                    `Product Name: ${item.productName}`,
                    `Quantity: ${item.quantity}`,
                    `Cost per Unit: ${item.cost} BAM`
                ]);
                doc.moveDown();
            });
        }
    });

    if (!hasProducts) {
        doc.moveDown().fontSize(12).text("No products found for this contract.");
    }

    doc.end();
});

module.exports = router;
