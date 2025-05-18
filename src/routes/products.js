const express = require('express');
const { Product } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const Sequelize = require('sequelize');
const router = express.Router();


/* 
 - ruta za vracanje lijekova iz baze
 - mogućnost filtriranja po nazivu, proizvodjacu, datumu isteka i min/max (ili oboje) cijeni
 - datum isteka moze se samo unijeti pocetna ili krajnja granica, ili obje tako da trazimo specifican opseg datuma
 - ista logika vrijedi za pretrazivanje po cijeni
*/
router.get('/products', async (req, res) => {
    const { name, manufacturer, expirationDateFrom, expirationDateTo, minPrice, maxPrice } = req.query;

    try {
        const filters = {};

        if (name) {
            filters.name = { [Op.like]: `%${name}%` };
        }

        if (manufacturer) {
            filters.manufacturer = { [Op.like]: `%${manufacturer}%` };
        }

        if (expirationDateFrom && expirationDateTo) {
            filters.expirationDate = {
                [Op.between]: [new Date(expirationDateFrom), new Date(expirationDateTo)],
            };
        } else if (expirationDateFrom) {
            filters.expirationDate = {
                [Op.gte]: new Date(expirationDateFrom),
            };
        } else if (expirationDateTo) {
            filters.expirationDate = {
                [Op.lte]: new Date(expirationDateTo),
            };
        }

        if (minPrice && maxPrice) {
            filters.price = {
                [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)],
            };
        } else if (minPrice) {
            filters.price = {
                [Op.gte]: parseFloat(minPrice),
            };
        } else if (maxPrice) {
            filters.price = {
                [Op.lte]: parseFloat(maxPrice),
            };
        }

        const products = await Product.findAll({ where: filters });

        res.json({ products });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'There was an error fetching the products.' });
    }
});


/*
    Za proslijeđene lijekove nalazi sve dobavljače i posljednju nabavnu cijenu te ih vraća. Primjena kod generisanja brzih
    ugovora.
*/
router.post('/products/supplier-info', async (req, res) => {
  const { productNames } = req.body;

  if (!Array.isArray(productNames) || productNames.length === 0) {
    return res.status(400).json({ message: 'productNames mora biti niz' });
  }

  try {
    const InvoiceItems = sequelize.models.InvoiceItems;
    const Invoice = sequelize.models.Invoice;
    const Delivery = sequelize.models.Delivery;
    const Contract = sequelize.models.Contract;
    const Supplier = sequelize.models.Supplier;

    const results = {};

    for (const name of productNames) {
      const items = await InvoiceItems.findAll({
        where: { productName: name },
        include: {
          model: Invoice,
          include: {
            model: Delivery,
            include: {
              model: Contract,
              include: Supplier
            }
          }
        },
        order: [['createdAt', 'DESC']]
      });

      const suppliersSet = new Set();
      let latestCost = null;

      for (const item of items) {
        const supplier = item.Invoice?.Delivery?.Contract?.Supplier;
        if (supplier) suppliersSet.add(supplier.name);

        if (latestCost === null) latestCost = item.cost;
      }

      results[name] = {
        suppliers: [...suppliersSet],
        latestCost: latestCost ?? 0
      };
    }

    res.json(results);
  } catch (err) {
    console.error('Greška pri dohvaćanju dobavljača i cijena:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

/* 
    Dohvaćanje najprodavanijih lijekova.
*/
router.get('/products/bestsellers', async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { Product, SalesInvoice, SalesInvoiceItems } = require('../models');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bestsellers = await SalesInvoiceItems.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('SalesInvoiceItems.quantity')), 'totalSold']
      ],
      include: [
        {
          model: SalesInvoice,
          attributes: [], // ne povlači nikakve kolone, samo filtriraj
          where: {
            issueDate: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'quantity']
        }
      ],
      group: ['SalesInvoiceItems.productId', 'Product.id', 'Product.name', 'Product.price', 'Product.quantity'],
      order: [[Sequelize.literal('totalSold'), 'DESC']],
      limit: 5
    });

    const result = bestsellers.map(item => ({
      id: item.Product.id,
      name: item.Product.name,
      price: item.Product.price,
      quantity: item.Product.quantity
    }));

    res.json({ products: result });

  } catch (error) {
    console.error("Greška kod /bestsellers:", error);
    res.status(500).json({ message: 'Greška kod dohvaćanja najprodavanijih lijekova.' });
  }
});

module.exports = router;