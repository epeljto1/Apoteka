const express = require('express');
const router = express.Router();
const { Supplier, Contract, Delivery } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

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

router.get('/suppliers/report', async (req, res) => {
    try {
      function normalize(str) {
        return str
          .toLowerCase()
          .normalize("NFD")              // razdvoji dijakritike
          .replace(/[\u0300-\u036f]/g, '') // ukloni ih
          .replace(/\s+/g, '');          // ukloni razmake
      }
      const suppliers = await Supplier.findAll({
        include: {
          model: Contract,
          include: [Delivery]
        }
      });
  
      const data = suppliers.map(supplier => {
        const contracts = supplier.Contracts;
  
        const statusCounts = {
          aktivan: 0,
          neaktivan: 0,
          uspjesnookoncan: 0,
          neuspjesnookoncan: 0,
        };
  
        let uspjesneIsporuke = 0;
        let neuspjesneIsporuke = 0;
  
        contracts.forEach(contract => {
          // Broji statuse ugovora
          const statusKey = normalize(contract.status);
          if (statusCounts.hasOwnProperty(statusKey)) {
            statusCounts[statusKey]++;
          }
  
          // Isporuke
          contract.Deliveries.forEach(delivery => {
            const stat = normalize(delivery.status);
            if (stat === 'uspjesna') uspjesneIsporuke++;
            else if (stat === 'neuspjesna') neuspjesneIsporuke++;
          });
        });
  
        return {
          name: supplier.name,
          address: supplier.address,
          contractCount: contracts.length,
          aktivan: statusCounts.aktivan,
          neaktivan: statusCounts.neaktivan,
          uspjesnoOkoncan: statusCounts.uspjesnookoncan,
          neuspjesnoOkoncan: statusCounts.neuspjesnookoncan,
          uspjesneIsporuke,
          neuspjesneIsporuke
        };
      });
  
      // Rangiranje
      const ranked = data.sort((a, b) => {
        if (b.uspjesnoOkoncan !== a.uspjesnoOkoncan) {
          return b.uspjesnoOkoncan - a.uspjesnoOkoncan;
        }
        if (b.uspjesneIsporuke !== a.uspjesneIsporuke) {
          return b.uspjesneIsporuke - a.uspjesneIsporuke;
        }
        return b.aktivan - a.aktivan;
      });

      if (req.query.format === 'json') {
        return res.json(ranked);
      }
  
      // === PDF GENERISANJE ===
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=izvjestaj_dobavljaci.pdf');
      doc.pipe(res);
  
      // Naslov
      doc.fontSize(18).text('Izvještaj o dobavljacima', { align: 'center' });
      doc.moveDown();
  
      // Tabela
      const tableTop = 100;
      const tableLeft = 15;
      const rowHeight = 30;
      const colWidths = [20, 90, 80, 50, 50, 50, 50, 60, 50, 65];
  
      function drawTableRow(doc, y, row, isHeader = false) {
        let x = tableLeft;
        row.forEach((cell, i) => {
          doc
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(10)
            .text(cell.toString(), x + 2, y + 5, {
              width: colWidths[i] - 4,
              align: 'left'
            });
  
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          x += colWidths[i];
        });
      }
  
      // Zaglavlje
      drawTableRow(doc, tableTop, [
        'Rbr', 'Naziv', 'Adresa', 'Ugovori', 'Aktivni', 'Neaktivni',
        'Uspješni', 'Neuspješni', 'Uspješne isporuke', 'Neuspješne isporuke'
      ], true);
  
      // Redovi
      let y = tableTop + rowHeight;
      ranked.forEach((r, i) => {
        const row = [
          i + 1, r.name, r.address, r.contractCount,
          r.aktivan, r.neaktivan, r.uspjesnoOkoncan,
          r.neuspjesnoOkoncan, r.uspjesneIsporuke, r.neuspjesneIsporuke
        ];
  
        drawTableRow(doc, y, row);
        y += rowHeight;
  
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = tableTop;
          drawTableRow(doc, y, [
            'Rbr', 'Naziv', 'Adresa', 'Ugov.', 'Akt.', 'Neakt.',
            'Uspj. ug.', 'Neuspj. ug.', 'Uspj. isp.', 'Neuspj. isp.'
          ], true);
          y += rowHeight;
        }
      });
  
      doc.end();
  
    } catch (err) {
      console.error('Greška pri kreiranju izvještaja:', err);
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