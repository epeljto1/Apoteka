const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
    const Role = sequelize.define("Role",{
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        privileges: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

    });
    return Role;
};