const express = require('express');
const router = express.Router();
const { Supplier, Contract } = require('../models');
const { sequelize } = require('../config/db');

router.get('/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.json({ suppliers });
    } catch (error) {
        console.error('Greška pri dohvatu dobavljača:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

router.delete('/suppliers/:id', async (req, res) => {
    const supplierId = req.params.id;
    const t = await sequelize.transaction();

    try {
        // 1. Prvo nulliraj sve Contracts koji imaju tog dobavljača
        await Contract.update(
            { supplierId: null },
            { where: { supplierId: supplierId }, transaction: t }
        );

        // 2. Onda obriši dobavljača
        const deleted = await Supplier.destroy({
            where: { id: supplierId },
            transaction: t
        });

        if (deleted === 0) {
            // Ako nije našao supplier za brisanje
            await t.rollback();
            return res.status(404).json({ message: 'Dobavljač nije pronađen.' });
        }

        // 3. Ako je sve prošlo, potvrdi transakciju
        await t.commit();
        res.status(200).json({ message: 'Dobavljač uspješno obrisan.' });

    } catch (error) {
        console.error('Greška pri brisanju dobavljača:', error);
        await t.rollback(); // Ako bilo šta pukne, rollback
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

router.get('/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
            return res.status(404).json({ message: 'Dobavljač nije pronađen.' });
        }

        res.json({ supplier });
    } catch (error) {
        console.error('Greška pri dohvatu dobavljača:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

router.post('/suppliers', async (req, res) => {
    const { name, contactNumber, email, address, website } = req.body;

    if (!name || !contactNumber || !email || !address || !website) {
        return res.status(400).json({ message: 'Sva polja su obavezna.' });
    }

    try {
        const newSupplier = await Supplier.create({
            name,
            contactNumber,
            email,
            address,
            website
        });

        res.status(201).json({ supplier: newSupplier });
    } catch (error) {
        console.error('Greška pri dodavanju dobavljača:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

module.exports = router;