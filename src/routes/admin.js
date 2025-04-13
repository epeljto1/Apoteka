const express = require('express');
const { User, Role } = require('../models'); 
const bcrypt = require('bcrypt');
const router = express.Router();


router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Role,
                as: 'Role', 
                attributes: ['userType'] 
            }]
        });

        console.log(users);  
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { firstName, lastName, username, password, roleId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ firstName, lastName, username, password: hashedPassword, roleId });
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Failed to add user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { firstName, lastName, username, password, roleId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.username = username;
        user.roleId = roleId;

        if (password) {
            const bcrypt = require('bcrypt');
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roleId: user.roleId
        });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});


router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

module.exports = router;
