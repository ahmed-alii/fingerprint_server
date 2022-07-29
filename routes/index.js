let express = require('express');
let router = express.Router();
let isLoggedIn = require("../middlewares/IsLoggedIn")

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.get('/forgot-password', function (req, res, next) {
    res.render('forgot-password', {title: 'Express'});
});


router.get('/dash', isLoggedIn, function (req, res, next) {
    res.render('forgot-password', {title: 'Express'});
});


router.get('/new-data', isLoggedIn, function (req, res, next) {
    res.render('new-data', {title: 'New record'});
});

module.exports = router;
