const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const SalesInvoice = sequelize.define("SalesInvoice", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        issueDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        totalAmount: {
            type: Sequelize.DOUBLE,
            allowNull: false
        }
    });
    return SalesInvoice;
};