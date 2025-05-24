const express = require('express');
const router = express.Router();
const { Delivery, Invoice, InvoiceItems } = require('../models');
const db = require('../models'); // putanja prema tvom db objektu
const { Op } = require('sequelize');


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


router.put('/api/delivery/:id', async (req, res) => {
    const deliveryId = req.params.id;
    const { deliveryDate, status } = req.body;

    try {
        const delivery = await Delivery.findByPk(deliveryId);

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        delivery.deliveryDate = deliveryDate ?? delivery.deliveryDate;
        delivery.status = status ?? delivery.status;

        await delivery.save();

        res.json({ message: 'Delivery updated successfully', delivery });
    } catch (error) {
        console.error('Error updating delivery:', error);
        res.status(500).json({ error: 'Error updating delivery' });
    }
});



router.get('/todays-deliveries', async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const deliveries = await db.Delivery.findAll({
      where: {
        deliveryDate: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: db.Contract,
          include: [db.Supplier]
        },
        {
          model: db.Invoice,
          include: [db.InvoiceItems]
        }
      ]
    });

    const response = deliveries.map(delivery => ({
      id: delivery.id,
      deliveryDate: delivery.deliveryDate,
      supplierName: delivery.Contract?.Supplier?.name || 'Unknown',
      products: delivery.Invoice?.InvoiceItems?.map(item => item.productName) || []
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading delivery.' });
  }
});



module.exports = router;
