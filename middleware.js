module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must first login!');
        return res.redirect('/login');
    }
    next();
 }