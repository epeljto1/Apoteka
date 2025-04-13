const path = require('path');
const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/products.html'));
});
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/dashboard.html'));
});

router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/index.html'));
});


module.exports = router;
