require('dotenv').config();

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false
});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Role = require('../models/Role')(sequelize, Sequelize.DataTypes);
db.User = require('../models/User')(sequelize, Sequelize.DataTypes);
db.Product = require('../models/Product')(sequelize, Sequelize.DataTypes);
db.SalesInvoice = require('../models/SalesInvoice')(sequelize, Sequelize.DataTypes);
db.SalesInvoiceItems = require('../models/SalesInvoiceItems')(sequelize, Sequelize.DataTypes);
db.Modification = require('../models/Modification')(sequelize, Sequelize.DataTypes);
db.Contract = require('../models/Contract')(sequelize, Sequelize.DataTypes);
db.Supplier = require('../models/Supplier')(sequelize, Sequelize.DataTypes);
db.Delivery = require('../models/Delivery')(sequelize, Sequelize.DataTypes);
db.Invoice = require('../models/Invoice')(sequelize, Sequelize.DataTypes);
db.InvoiceItems = require('../models/InvoiceItems')(sequelize, Sequelize.DataTypes);

db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });

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