const authRoutes = require("./auth-routes");

module.exports = function(app, db) {
	authRoutes(app, db);
}