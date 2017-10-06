var expired = true;
var token = "";

$(document).ready(function () {
	$("#submit").click(submit);

	$("#artist-b-input").keypress(function (event) {
		if(event.which === 13) {
			submit();
		}
	});

	$("#artist-a-input").keyup(updateArtistASuggestions);

	$("#artist-b-input").keyup(updateArtistBSuggestions);
});

function authenticate() {
	var authUrl = "http://localhost:8000/auth";
	$.getJSON(authUrl, function (response) {
		token = response.token;
	});
}

function submit() {
	console.log("submit");
}

function updateArtistASuggestions() {
	console.log("suggestionsForA");
}

function updateArtistBSuggestions() {
	console.log("suggestionsForB");
}

function searchArtists(input) {

}