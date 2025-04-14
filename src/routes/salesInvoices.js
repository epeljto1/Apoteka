const express = require('express');
const { SalesInvoice, SalesInvoiceItems, Product } = require('../models');
const router = express.Router();


// ruta koja vraca prodajne fakture. NESTO NIJE UREDU TREBA TROUBLESHOOT KAD ZATREBA
router.get('/salesInvoices', async (req, res) => {
    try {
        const invoices = await SalesInvoice.findAll({
            include: [{
                model: SalesInvoiceItems,
                include: [Product]
            }]
        });

        res.status(200).json({ invoices });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška pri dohvaćanju faktura.' });
    }
});

module.exports = router;