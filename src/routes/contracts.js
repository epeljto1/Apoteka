const express = require('express');
const router = express.Router();
const path = require('path');
const PDFDocument = require('pdfkit');
const { Contract, Supplier, Delivery, Invoice, InvoiceItems, Product, Modification} = require('../models');


// Dohvati sve ugovore sa dobavljačima
router.get('/contracts', async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            include: [{ model: Supplier }]
        });
        res.json(contracts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Greška pri dohvaćanju ugovora');
    }
});


router.get('/contracts/:id/pdf', async (req, res) => {
    const contractId = req.params.id;

    // Pronađi ugovor sa dobavljačem
    const contract = await Contract.findByPk(contractId, {
        include: [{ model: Supplier }]
    });

    if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
    }

    // Pronađi sve dostave s fakturama i stavkama
    const deliveries = await Delivery.findAll({
        where: { contractId },
        include: {
            model: Invoice,
            include: InvoiceItems
        }
    });

    // Kreiranje PDF-a
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.pdf`);
        res.end(pdfData);
    });

    // Naslov i osnovni podaci
    doc.image(path.join(__dirname, '../../public/pictures/logo.png'), 50, 45, { width: 50 });
    doc.fontSize(20).text('Contract', 110, 57).moveDown();
    doc.fontSize(12);
    
    const fields = [
        { label: 'Contract ID', value: contract.id },
        { label: 'Subject', value: contract.subject },
        { label: 'Conclusion Date', value: new Date(contract.conclusionDate).toLocaleDateString() },
        { label: 'Expiration Date', value: new Date(contract.expirationDate).toLocaleDateString() },
        { label: 'Status', value: contract.status },
        { label: 'Supplier Name', value: contract.Supplier.name },
        { label: 'Supplier Email', value: contract.Supplier.email }
    ];

    fields.forEach(field => {
        doc.font('Helvetica-Bold').text(`${field.label}: `, { continued: true });
        doc.font('Helvetica').text(field.value);
    });

    // Dodaj proizvode ako ih ima
    let hasProducts = false;
    deliveries.forEach((delivery, idx) => {
        const invoice = delivery.Invoice;
        if (invoice && invoice.InvoiceItems && invoice.InvoiceItems.length > 0) {
            if (!hasProducts) {
                doc.addPage().fontSize(16).text("Products", { underline: true }).moveDown();
                hasProducts = true;
            }

            doc.fontSize(14).text(`Delivery #${idx + 1} (${new Date(delivery.deliveryDate).toLocaleDateString()}):`);
            invoice.InvoiceItems.forEach(item => {
                doc.fontSize(12).list([
                    `Product Name: ${item.productName}`,
                    `Quantity: ${item.quantity}`,
                    `Cost per Unit: ${item.cost} BAM`
                ]);
                doc.moveDown();
            });
        }
    });

    if (!hasProducts) {
        doc.moveDown().fontSize(12).text("No products found for this contract.");
    }

    doc.end();
});

router.post('/contracts', async (req, res) => { 
    const t = await Contract.sequelize.transaction();

    try {
        const {
            subject,
            conclusionDate,
            expirationDate,
            conditions,
            status,
            supplierId,
            deliveryDate,
            deliveryStatus,
            items
        } = req.body;

        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
            return res.status(400).json({ message: "Dobavljač nije pronađen." });
        }

        const contract = await Contract.create({
            subject,
            conclusionDate,
            expirationDate,
            conditions,
            status,
            supplierId
        }, { transaction: t });

        const delivery = await Delivery.create({
            deliveryDate,
            status: deliveryStatus,
            contractId: contract.id
        }, { transaction: t });

        const totalAmount = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

        const invoice = await Invoice.create({
            issueDate: new Date(),
            totalAmount,
            paymentMethod: 'Cash', 
            deliveryId: delivery.id
        }, { transaction: t });

        for (const item of items) {
            await InvoiceItems.create({
                productName: item.productName,
                quantity: item.quantity,
                cost: item.cost,
                invoiceId: invoice.id
            }, { transaction: t });

            let existingProduct = await Product.findOne({
                where: { name: item.productName },
                transaction: t
            });

            if (existingProduct) {
                existingProduct.quantity += item.quantity;
                await existingProduct.save({ transaction: t });
            } else {
                await Product.create({
                    name: item.productName,
                    description: "",        
                    ingredients: "",        
                    manufacturer: supplier.name,  
                    expirationDate: new Date(),   
                    price: item.cost,
                    quantity: item.quantity
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: "Contract created successfully", contractId: contract.id });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to create contract" });
    }
});


router.put('/contracts/:id', async (req, res) => {
    const contractId = req.params.id;
    const userId = req.session?.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Niste prijavljeni" });
    }

    const {
        subject,
        conclusionDate,
        expirationDate,
        conditions,
        status,
        supplierId,
        purpose,
        deliveryDate,
        deliveryStatus,
        items // format: [{ productName, quantity, cost }]
    } = req.body;

    const t = await Contract.sequelize.transaction();

    try {
        const contract = await Contract.findByPk(contractId, {
            include: {
                model: Delivery,
                include: [Invoice]
            },
            transaction: t
        });

        if (!contract) {
            await t.rollback();
            return res.status(404).json({ message: "Ugovor nije pronađen" });
        }

        // 1. Ažuriraj osnovne informacije o ugovoru
        await contract.update({
            subject,
            conclusionDate,
            expirationDate,
            conditions,
            status,
            supplierId
        }, { transaction: t });

        // 2. Dodaj novu verziju u Modification
        const existingMods = await contract.getModifications({ transaction: t });
        const nextVersion = `v${existingMods.length + 1}`;

        await Modification.create({
            modificationDate: new Date(),
            description: purpose || "Contract modification",
            version: nextVersion,
            contractId: contract.id,
            userId: userId
        }, { transaction: t });

        // 3. Ažuriraj Delivery
        const delivery = contract.Deliveries?.[0];
        if (!delivery) {
            await t.rollback();
            return res.status(400).json({ message: "Isporuka nije pronađena za ugovor." });
        }

        await delivery.update({
            deliveryDate,
            status: deliveryStatus
        }, { transaction: t });

        // 4. Ažuriraj Invoice i InvoiceItems
        const invoice = delivery.Invoice;
        if (!invoice) {
            await t.rollback();
            return res.status(400).json({ message: "Faktura nije pronađena za isporuku." });
        }

        // Briši stare stavke
        await InvoiceItems.destroy({ where: { invoiceId: invoice.id }, transaction: t });

        // Dodaj nove stavke i izračunaj totalAmount
        let totalAmount = 0;

        for (const item of items) {
            await InvoiceItems.create({
                productName: item.productName,
                quantity: item.quantity,
                cost: item.cost,
                invoiceId: invoice.id
            }, { transaction: t });

            totalAmount += item.quantity * item.cost;

            // (opciono) napravi novi proizvod - ili ažuriraj postojeći po imenu
            await Product.create({
                name: item.productName,
                description: "",
                ingredients: "",
                manufacturer: contract.supplierId,
                expirationDate: new Date(),
                price: item.cost,
                quantity: item.quantity
            }, { transaction: t });
        }

        await invoice.update({ totalAmount }, { transaction: t });

        await t.commit();
        return res.status(200).json({ message: "Ugovor uspješno ažuriran." });

    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({ message: "Greška prilikom ažuriranja ugovora." });
    }
});


router.get("/contracts/:id", async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id, {
            include: [
                {
                    model: Supplier,
                    as: "Supplier"
                },
                {
                    model: Delivery,
                    include: {
                        model: Invoice,
                        include: InvoiceItems
                    }
                }
            ]
        });

        if (!contract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        res.json({ contract });
    } catch (error) {
        console.error("Error fetching contract:", error);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
