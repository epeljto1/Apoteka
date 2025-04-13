const express = require('express');
const { Product } = require('../models');
const { Op } = require('sequelize');
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

module.exports = router;