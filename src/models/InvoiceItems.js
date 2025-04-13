const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const InvoiceItems = sequelize.define("InvoiceItems", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        productName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        cost: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        invoiceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Invoices',
                key: 'id'
            }
        }
    });
    return InvoiceItems;
};