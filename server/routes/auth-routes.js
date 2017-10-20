var spotifyApi = require("spotify-web-api-node");
var spotify = new spotifyApi({
	clientId: "bfe086d33c104a5fbd6af4c8183d4dd9",
	clientSecret: "498e6c721509402eba2d5dcfa8b481e5",
	redirectUri: "http://18.221.74.204/creative/angular/"
});

var token = "";

(function getToken() {
	spotify.clientCredentialsGrant().then(function (data) {
		token = data.body.access_token;
		console.log(token);
		setTimeout(getToken, data.body.expires_in * 1000);
	}, function (error) {
		retryTime = (Math.floor(Math.random() * (10 - 1)) + 1) * 1000;
		setTimeout(getToken, retryTime);
	});
})();

module.exports = function(app, db) {
	app.get("/auth", (request, response) => {
		response.send({
			token: token
		});
	});
};