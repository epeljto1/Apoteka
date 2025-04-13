const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const SalesInvoiceItems = sequelize.define("SalesInvoiceItems", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        salesInvoiceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'SalesInvoices',
                key: 'id'
            }
        }
    });
    return SalesInvoiceItems;
};
