function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    // console.log("Not logged in...")
    // res.redirect("/");
    //todo: temporary bypass
    return next();

}

module.exports = isLoggedIn;