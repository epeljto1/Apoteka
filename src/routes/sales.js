const express = require('express');
const { Product, SalesInvoice, SalesInvoiceItems } = require('../models');
const router = express.Router();

// Ruta za prodaju lijekova koja automatski generiše i odgovarajuću fakturu sa stavkama i spašava promjene u bazu.
router.post('/sell', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Nisu poslani validni artikli.' });
    }

    try {
        let totalAmount = 0;
        const invoiceItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);

            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ message: `Nedovoljno zaliha za ${product?.name || 'nepoznat proizvod'}.` });
            }

            totalAmount += product.price * item.quantity;

            invoiceItems.push({ product, quantity: item.quantity });
        }

        const invoice = await SalesInvoice.create({
            issueDate: new Date(),
            totalAmount
        });

        for (const item of invoiceItems) {
            await SalesInvoiceItems.create({
                salesInvoiceId: invoice.id,
                productId: item.product.id,
                quantity: item.quantity
            });

            item.product.quantity -= item.quantity;
            await item.product.save();
        }

        res.status(200).json({
            message: 'Prodaja uspješna!',
            invoice: {
                id: invoice.id,
                totalAmount: invoice.totalAmount,
                items: invoiceItems.map(item => ({
                    product: {
                        name: item.product.name,
                        price: item.product.price
                    },
                    quantity: item.quantity
                }))
            }
        });
    } catch (err) {
        console.error('Greška pri prodaji:', err);
        res.status(500).json({ message: 'Greška pri evidentiranju prodaje.' });
    }
});

module.exports = router;