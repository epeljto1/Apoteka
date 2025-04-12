const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');  
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            roleId: user.roleId
        };

        res.json({
            message: 'Login successful',
            user: { username: user.username, roleId: user.roleId }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'There was an error during login' });
    }
});

module.exports = router;
