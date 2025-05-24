const express = require('express');
const router = express.Router();
const db = require('../models');
const { sequelize } = require('../config/db');
const { SalesInvoice, SalesInvoiceItems, Product, Report} = db;  
const PDFDocument = require('pdfkit');
const fs = require('fs');

router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.findAll();
        res.json({ reports });
    } catch (error) {
        console.error('Greška pri dohvatu izvještaja:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

router.get('/reports/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const report = await Report.findByPk(id);

        if (!report) {
            return res.status(404).json({ message: 'Izvještaj nije pronađen.' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Greška pri dohvatu izvještaja:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

const { Op } = require('sequelize');

router.post('/reports/promet', async (req, res) => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Oba datuma su obavezna.' });
    }

    try {
        // Pronađi sve fakture unutar datog vremenskog perioda
        const invoices = await db.SalesInvoice.findAll({
            where: {
                issueDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [{
                model: SalesInvoiceItems,
                include: [db.Product]
            }]
        });

        const reportData = {};

        // Agregacija podataka
        invoices.forEach(invoice => {
            invoice.SalesInvoiceItems.forEach(item => {
                const product = item.Product;
                const key = product.id;

                if (!reportData[key]) {
                    reportData[key] = {
                        name: product.name,
                        manufacturer: product.manufacturer,
                        price: product.price,
                        totalSold: 0,
                        totalEarnings: 0
                    };
                }

                reportData[key].totalSold += item.quantity;
                reportData[key].totalEarnings += item.quantity * product.price;
            });
        });

        // Kreiraj novi izvještaj u bazi
        const newReport = await db.Report.create({
            name: 'Novi izvještaj',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalSold: Object.values(reportData).reduce((sum, product) => sum + product.totalSold, 0),
            totalEarnings: Object.values(reportData).reduce((sum, product) => sum + product.totalEarnings, 0)
        });

        // Pretvaranje u listu i sortiranje
        const sortedReport = Object.values(reportData).sort((a, b) => {
            if (b.totalSold !== a.totalSold) return b.totalSold - a.totalSold;
            return b.totalEarnings - a.totalEarnings;
        });

        res.json({ report: sortedReport });

    } catch (error) {
        console.error('Greška pri generisanju izvještaja:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});
function normalizeStatus(status) {
    if (!status) return 'unknown';
    const normalized = status.toLowerCase();

    if (['aktivan', 'active'].includes(normalized)) return 'active';
    if (['neaktivan', 'inactive', 'pending'].includes(normalized)) return 'pending';
    if (['uspješno okončan', 'fulfilled', 'finished', 'completed'].includes(normalized)) return 'completed';
    if (['neuspješno okončan', 'raskinut', 'terminated', 'failed'].includes(normalized)) return 'failed';

    return 'other';
}
router.post('/reports/contracts', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const where = {};
        if (startDate && endDate) {
            where.conclusionDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        } else if (startDate) {
            where.conclusionDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            where.conclusionDate = { [Op.lte]: new Date(endDate) };
        }

        const contracts = await db.Contract.findAll({ where });
        const report = {
            totalContracts: contracts.length,
            completed: contracts.filter(c => normalizeStatus(c.status) === 'completed').length,
            failed: contracts.filter(c => normalizeStatus(c.status) === 'failed').length,
            pending: contracts.filter(c => normalizeStatus(c.status) === 'pending').length,
            active: contracts.filter(c => normalizeStatus(c.status) === 'active').length,
            changes: contracts.reduce((sum, c) => sum + (c.numberOfChanges || 0), 0)
        };

        res.json({ report });

    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});
router.post('/reports/promet/download-pdf', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const invoices = await db.SalesInvoice.findAll({
            where: {
                issueDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [{
                model: db.SalesInvoiceItems,
                include: [db.Product]
            }]
        });

        const reportData = {};
        invoices.forEach(invoice => {
            invoice.SalesInvoiceItems.forEach(item => {
                const product = item.Product;
                const key = product.id;

                if (!reportData[key]) {
                    reportData[key] = {
                        name: product.name,
                        manufacturer: product.manufacturer,
                        price: product.price,
                        totalSold: 0,
                        totalEarnings: 0
                    };
                }

                reportData[key].totalSold += item.quantity;
                reportData[key].totalEarnings += item.quantity * product.price;
            });
        });

        const sortedData = Object.values(reportData).sort((a, b) => {
            if (b.totalSold !== a.totalSold) return b.totalSold - a.totalSold;
            return b.totalEarnings - a.totalEarnings;
        });

        
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Disposition', 'attachment; filename=izvjestaj.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);
        
        // Naslov i period
        doc.fontSize(20).text('Izvještaj o prodaji', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(12).text(`Period:    ${startDate}    do    ${endDate}`, { align: 'center' });
        doc.moveDown(1.5);
        
        // Zaglavlje tabele
        doc.font('Helvetica-Bold').fontSize(11);
        // Definicija kolona
        const col1 = 50;    // Naziv proizvoda
        const col2 = 200;   // Proizvođač
        const col3 = 330;   // Cijena
        const col4 = 400;   // Količina
        const col5 = 470;   // Ukupno
        let y = doc.y;

        // Zaglavlja
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Naziv proizvoda', col1, y);
        doc.text('Proizvodac', col2, y);
        doc.text('Cijena (KM)', col3, y, { width: 60, align: 'right' });
        doc.text('Kolicina', col4, y, { width: 50, align: 'right' });
        doc.text('Ukupno (KM)', col5, y, { width: 60, align: 'right' });

        y = doc.y;
        doc.moveTo(col1, y).lineTo(550, y).stroke();
        doc.moveDown(0.5);

        // Font za redove
        doc.font('Helvetica').fontSize(10);

        let totalSold = 0;
        let totalEarnings = 0;

        sortedData.forEach(product => {
            const lineY = doc.y;

            doc.text(product.name, col1, lineY);
            doc.text(product.manufacturer, col2, lineY);
            doc.text(product.price.toFixed(2), col3, lineY, { width: 60, align: 'right' });
            doc.text(product.totalSold.toString(), col4, lineY, { width: 50, align: 'right' });
            doc.text(product.totalEarnings.toFixed(2), col5, lineY, { width: 60, align: 'right' });

            totalSold += product.totalSold;
            totalEarnings += product.totalEarnings;

            if (doc.y > 720) doc.addPage();
        });

        doc.moveDown(2);
        
        // Ukupne vrijednosti
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(`Ukupno prodatih artikala: ${totalSold}`, col1);
        doc.text(`Ukupan prihod: ${totalEarnings.toFixed(2)} KM`, col1);
        
        // Datum generisanja izvještaja
        doc.moveDown(2);
        const today = new Date();
        const formattedDate = `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}.`;
        doc.text(`Datum generisanja izvještaja: ${formattedDate}`, { align: 'right' });
        
        doc.moveDown(2);
        doc.text('________________________', { align: 'right' });
        doc.text('Potpis odgovorne osobe', { align: 'right' });
        
        doc.end();
        
    } catch (error) {
        console.error('Greška pri generisanju PDF-a:', error);
        res.status(500).json({ message: 'Greška na serveru pri generisanju PDF-a.' });
    }
});

function drawKeyValueLine(key, value, y, doc) {
    const keyX = 50;
    const valueX = 300;

    doc.font('Helvetica-Bold').text(`${key}`, keyX, y);
    doc.font('Helvetica').text(`${value}`, valueX, y);
}

router.post('/reports/contracts/download-pdf', async (req, res) => {
    const { startDate, endDate } = req.body;
    const { Op } = require('sequelize');
    

    try {
        const where = {};
        if (startDate && endDate) {
            where.conclusionDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        } else if (startDate) {
            where.conclusionDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            where.conclusionDate = { [Op.lte]: new Date(endDate) };
        }

        const contracts = await db.Contract.findAll({ where });

        const report = {
            totalContracts: contracts.length,
            completed: contracts.filter(c => normalizeStatus(c.status) === 'completed').length,
            failed: contracts.filter(c => normalizeStatus(c.status) === 'failed').length,
            pending: contracts.filter(c => normalizeStatus(c.status) === 'pending').length,
            active: contracts.filter(c => normalizeStatus(c.status) === 'active').length,
            changes: contracts.reduce((sum, c) => sum + (c.numberOfChanges || 0), 0)
        };
        
        contracts.forEach(c => {
            console.log('STATUS:', c.status, ' => ', normalizeStatus(c.status));
        });
        
        // Kreiranje PDF dokumenta
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Disposition', 'attachment; filename=ugovori-izvjestaj.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        // Naslov
        doc.fontSize(20).text('Izvještaj o ugovorima', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(12).text(`Period: ${startDate || '---'} do ${endDate || '---'}`, { align: 'center' });
        doc.moveDown(2);

        // Tabela
        let y = doc.y;

        drawKeyValueLine('Total:', report.totalContracts, y, doc);
        y += 20;
        drawKeyValueLine('Completed:', report.completed, y, doc);
        y += 20;
        drawKeyValueLine('Failed:', report.failed, y, doc);
        y += 20;
        drawKeyValueLine('Pending:', report.pending, y, doc);
        y += 20;
        drawKeyValueLine('Active:', report.active, y, doc);
        y += 20;
        drawKeyValueLine('Changes:', report.changes, y, doc);


        doc.moveDown(2);

        // Datum i potpis
        const today = new Date();
        const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}.`;
        doc.text(`Datum generisanja: ${formattedDate}`, { align: 'right' });
        doc.moveDown(2);
        doc.text('________________________', { align: 'right' });
        doc.text('Potpis odgovorne osobe', { align: 'right' });

        doc.end();

    } catch (err) {
        console.error('Greška pri generisanju PDF izvještaja o ugovorima:', err);
        res.status(500).json({ message: 'Greška pri generisanju PDF-a za ugovore.' });
    }
});

router.post('/reports/deliveries', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const where = {};
        if (startDate && endDate) {
            where.deliveryDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        } else if (startDate) {
            where.deliveryDateDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            where.deliveryDateDate = { [Op.lte]: new Date(endDate) };
        }

        const deliveries = await db.Delivery.findAll({ where });
        const deliveryIds = deliveries.map(d => d.id);
        const invoices = await db.Invoice.findAll({
            where: {
                deliveryId: {
                    [Op.in]: deliveryIds
                }
            }
        });
        const normalizeStatus = status => {
            const s = status.toLowerCase();
            if (['finished', 'uspješna', 'shipped', 'izvršena'].includes(s)) return 'finished';
            if (['neuspješna', 'nepotpuna', 'failed', 'incomplete', 'nepotpune'].includes(s)) return 'incomplete';
            if (['terminated', 'obustavljena', 'suspended'].includes(s)) return 'suspended';
            if (['processing', 'aktivna', 'active'].includes(s)) return 'active';
            return 'nepoznato';
        };
        const report = {
            totalDeliveries: deliveries.length,
            finished: deliveries.filter(d => normalizeStatus(d.status) === 'finished').length,
            incomplete: deliveries.filter(d => normalizeStatus(d.status) === 'incomplete').length,
            suspended: deliveries.filter(d => normalizeStatus(d.status) === 'suspended').length,
            active: deliveries.filter(d => normalizeStatus(d.status) === 'active').length,
            ukupnoUplaceno: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        };

        res.json({ report });

    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});
router.post('/reports/deliveries/download-pdf', async (req, res) => {
    const { startDate, endDate } = req.body;
    const { Op } = require('sequelize');
    

    try {
        const where = {};
        if (startDate && endDate) {
            where.deliveryDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        } else if (startDate) {
            where.deliveryDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            where.deliveryDate = { [Op.lte]: new Date(endDate) };
        }

        const deliveries = await db.Delivery.findAll({ where });
        const deliveryIds = deliveries.map(d => d.id);
        const invoices = await db.Invoice.findAll({
            where: {
                deliveryId: {
                    [Op.in]: deliveryIds
                }
            }
        });
        const normalizeStatus = status => {
            const s = status.toLowerCase();
            if (['finished', 'uspješna', 'shipped', 'izvršena'].includes(s)) return 'finished';
            if (['neuspješna', 'nepotpuna', 'failed'].includes(s)) return 'incomplete';
            if (['terminated', 'obustavljena', 'suspended'].includes(s)) return 'suspended';
            if (['processing', 'aktivna', 'active'].includes(s)) return 'active';
            return 'nepoznato';
        };
        const report = {
            totalDeliveries: deliveries.length,
            finished: deliveries.filter(d => normalizeStatus(d.status) === 'finished').length,
            incomplete: deliveries.filter(d => normalizeStatus(d.status) === 'incomplete').length,
            suspended: deliveries.filter(d => normalizeStatus(d.status) === 'suspended').length,
            active: deliveries.filter(d => normalizeStatus(d.status) === 'active').length,
            ukupnoUplaceno: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        };

        deliveries.forEach(c => {
            console.log('STATUS:', c.status, ' => ', normalizeStatus(c.status));
        });
        
        // Kreiranje PDF dokumenta
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Disposition', 'attachment; filename=ugovori-izvjestaj.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        // Naslov
        doc.fontSize(20).text('Izvještaj o isporukama', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(12).text(`Period: ${startDate || '---'} do ${endDate || '---'}`, { align: 'center' });
        doc.moveDown(2);

        // Tabela
        let y = doc.y;

        drawKeyValueLine('Total:', report.totalDeliveries, y, doc);
        y += 20;
        drawKeyValueLine('Finished:', report.finished, y, doc);
        y += 20;
        drawKeyValueLine('Incomplete:', report.incomplete, y, doc);
        y += 20;
        drawKeyValueLine('Suspended:', report.suspended, y, doc);
        y += 20;
        drawKeyValueLine('Active:', report.active, y, doc);
        y += 20;
        drawKeyValueLine('Total amount:', report.ukupnoUplaceno, y, doc);


        doc.moveDown(2);

        // Datum i potpis
        const today = new Date();
        const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}.`;
        doc.text(`Datum generisanja: ${formattedDate}`, { align: 'right' });
        doc.moveDown(2);
        doc.text('________________________', { align: 'right' });
        doc.text('Potpis odgovorne osobe', { align: 'right' });

        doc.end();

    } catch (err) {
        console.error('Greška pri generisanju PDF izvještaja o izvjestajima:', err);
        res.status(500).json({ message: 'Greška pri generisanju PDF-a za izvjestajima.' });
    }
});
module.exports = router;