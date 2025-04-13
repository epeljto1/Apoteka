const express = require('express');
const { User, Role } = require('../models'); 
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

module.exports = router;
