const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
    const User = sequelize.define("User",{
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        roleId: { 
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles',
                key: 'id'
            }
        }

    });
    return User;
};