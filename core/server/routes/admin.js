var admin       = require('../controllers/admin'),
    api         = require('../api'),
    middleware  = require('../middleware').middleware;

// Redirect to signup if no users are currently created
function redirectToSignup(req, res, next) {
    /*jslint unparam:true*/
    api.users.browse().then(function (users) {
        if (users.length === 0) {
            return res.redirect('/ghost/signup/');
        }
        next();
    }).otherwise(function (err) {
        return next(new Error(err));
    });
}

module.exports = function (server) {
    // ### Admin routes
    /* TODO: put these somewhere in admin */
    server.get(/^\/logout\/?$/, function redirect(req, res) {
        /*jslint unparam:true*/
        res.redirect(301, '/signout/');
    });
    server.get(/^\/signout\/?$/, admin.logout);
    server.get('/ghost/login/', function redirect(req, res) {
        /*jslint unparam:true*/
        res.redirect(301, '/ghost/signin/');
    });
    server.get('/ghost/signin/', redirectToSignup, middleware.redirectToDashboard, admin.login);
    server.get('/ghost/signup/', middleware.redirectToDashboard, admin.signup);
    server.get('/ghost/forgotten/', middleware.redirectToDashboard, admin.forgotten);
    server.post('/ghost/forgotten/', admin.resetPassword);
    server.post('/ghost/signin/', admin.auth);
    server.post('/ghost/signup/', admin.doRegister);
    server.post('/ghost/changepw/', middleware.auth, admin.changepw);
    server.get('/ghost/editor(/:id)/', middleware.auth, admin.editor);
    server.get('/ghost/editor/', middleware.auth, admin.editor);
    server.get('/ghost/content/', middleware.auth, admin.content);
    server.get('/ghost/settings*', middleware.auth, admin.settings);
    server.get('/ghost/debug/', middleware.auth, admin.debug.index);

    // We don't want to register bodyParser globally b/c of security concerns, so use multipart only here
    server.post('/ghost/upload/', middleware.auth, admin.uploader);

    // redirect to /ghost and let that do the authentication to prevent redirects to /ghost//admin etc.
    server.get(/^\/((ghost-admin|admin|wp-admin|dashboard|signin)\/?)/, function (req, res) {
        /*jslint unparam:true*/
        res.redirect('/ghost/');
    });
    server.get(/^\/(ghost$\/?)/, middleware.auth, function (req, res) {
        /*jslint unparam:true*/
        res.redirect('/ghost/');
    });
    server.get('/ghost/', redirectToSignup, middleware.auth, admin.index);
};