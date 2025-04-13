const path = require('path');
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/products.html'));
});

module.exports = router;
