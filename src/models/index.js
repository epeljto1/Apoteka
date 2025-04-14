const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.SalesInvoice.hasMany(db.SalesInvoiceItems, { foreignKey: 'salesInvoiceId' });
db.SalesInvoiceItems.belongsTo(db.SalesInvoice, { foreignKey: 'salesInvoiceId' });

db.Product.hasMany(db.SalesInvoiceItems, { foreignKey: 'productId' });
db.SalesInvoiceItems.belongsTo(db.Product, { foreignKey: 'productId' });

db.Supplier.hasMany(db.Contract, { foreignKey: 'supplierId' });
db.Contract.belongsTo(db.Supplier, { foreignKey: 'supplierId' });

db.Contract.hasMany(db.Modification, { foreignKey: 'contractId' });
db.Modification.belongsTo(db.Contract, { foreignKey: 'contractId' });

db.User.hasMany(db.Modification, { foreignKey: 'userId' });
db.Modification.belongsTo(db.User, { foreignKey: 'userId' });

db.Contract.hasMany(db.Delivery, { foreignKey: 'contractId' });
db.Delivery.belongsTo(db.Contract, { foreignKey: 'contractId' });

db.Delivery.hasOne(db.Invoice, { foreignKey: 'id' });
db.Invoice.belongsTo(db.Delivery, { foreignKey: 'id' });

db.Invoice.hasMany(db.InvoiceItems, { foreignKey: 'invoiceId' });
db.InvoiceItems.belongsTo(db.Invoice, { foreignKey: 'invoiceId' });

module.exports = db;