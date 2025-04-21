const express = require('express');
const router = express.Router();
const { Delivery, Invoice, InvoiceItems } = require('../models');

router.get('/alldeliveries', async (req, res) => {
    try {
        const deliveries = await Delivery.findAll({
            attributes: ['id', 'deliveryDate']
        });
        res.json(deliveries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching deliveries' });
    }
});

router.get('/api/deliverydetails', async (req, res) => {
    const deliveryId = req.query.id;

    if (!deliveryId) {
        return res.status(400).json({ error: 'Missing delivery ID' });
    }

    try {
        const delivery = await Delivery.findOne({
            where: { id: deliveryId },
            attributes: ['id', 'deliveryDate', 'status'],
            include: [
                {
                    model: Invoice,
                    attributes: ['id', 'issueDate', 'totalAmount', 'paymentMethod'],
                    include: [
                        {
                            model: InvoiceItems,
                            attributes: ['id', 'productName', 'quantity', 'cost']
                        }
                    ]
                }
            ]
        });

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        res.json(delivery);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching delivery details' });
    }
});

module.exports = router;
