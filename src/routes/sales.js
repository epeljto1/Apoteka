const express = require('express');
const { Product, SalesInvoice, SalesInvoiceItems } = require('../models');
const router = express.Router();

// Ruta za prodaju lijekova koja automatski generiše i odgovarajuću fakturu sa stavkama i spašava promjene u bazu.
router.post('/sell', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No valid items were submitted..' });
    }

    try {
        let totalAmount = 0;
        const invoiceItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);

            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'unknown item'}.` });
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
            message: 'Sale successful!',
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
        console.error('Sale error:', err);
        res.status(500).json({ message: 'Error recording sales.' });
    }
});

module.exports = router;