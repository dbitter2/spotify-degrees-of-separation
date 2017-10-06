const temp = 0;
const MAX_RELATED_ARTISTS = 5;
const ENTER_KEY = 13;
const SERVER = "http://[2605:a601:e04:300:154e:7ced:edab:5875]:8000/";
var artistNameIdMap = {};


$(document).ready(function () {
	$("#submit").click(submit);

	$("#artist-b-input").keypress(function (event) {
		if(event.which === ENTER_KEY) {
			submit();
		}
	});

	$("#artist-a-input").keyup(updateArtistASuggestions);

	$("#artist-b-input").keyup(updateArtistBSuggestions);
});

function submit() {
	var artistA = artistNameIdMap[$("#artist-a-input").val()];
	var artistB = artistNameIdMap[$("#artist-b-input").val()];
	if(artistA !== undefined && artistB !== undefined) {
		getRelatedArtists(artistA).then(function (artists) {
			$("#artist-a-output").text($("#artist-a-input").val() + " Related Artists: " + JSON.stringify(artists));
		});
		getRelatedArtists(artistB).then(function (artists) {
			$("#artist-b-output").text($("#artist-b-input").val() + " Related Artists: " + JSON.stringify(artists));
		});
	} else {
		$("#relationship-output").text("Something weird happened. I don't have a Spotify id for one or both of those artists.");
	}
}

function getRelatedArtists(artistId) {
	var relatedArtistsUrl = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";
	return authenticate().then(function (token) {
		return new Promise(function (resolve, reject) {
			$.ajax(relatedArtistsUrl, {
				headers: {"Authorization": "Bearer " + token},
				success: function (response) {
					var artists = response.artists.filter(function (artist, index) {
						return index < MAX_RELATED_ARTISTS;
					})
					artists = artists.map(function (artist) {
						return artist.name;
					});
					resolve(artists);
				}
			});
		});
	});
}

function updateArtistASuggestions() {
	$("#artist-a-suggestions").empty();
	searchArtists($("#artist-a-input").val()).then(function (artists) {
		optionsHtml = optionsHtmlForArray(artists);
		$("#artist-a-suggestions").html(optionsHtml);
	});
}

function updateArtistBSuggestions() {
	$("#artist-b-suggestions").empty();
	searchArtists($("#artist-b-input").val()).then(function (artists) {
		optionsHtml = optionsHtmlForArray(artists);
		$("#artist-b-suggestions").html(optionsHtml);
	});
}

function searchArtists(input) {
	if(input === "") {
		return [];
	}
	return authenticate().then(function (token) {
		var artists = [];
		var searchUrl = "https://api.spotify.com/v1/search?q=" + sanitize(input) + "&type=artist&limit=5";
		return new Promise(function (resolve, reject) {
			$.ajax(searchUrl, {
				headers: {"Authorization": "Bearer " + token},
				success: function (response) {
					response.artists.items.forEach(function (artist) {
						if(!artistNameIdMap.hasOwnProperty(artist.name)) {
							artistNameIdMap[artist.name] = artist.id;
						}
						artists.push(artist.name);
					});
					resolve(artists);
				}
			});
		});
	});
}

function optionsHtmlForArray(array) {
	var optionsHtml = "";
	array.forEach(function (item) {
		optionsHtml += "<option value='" + item + "'/>";
	});
	return optionsHtml;
}

function authenticate() {
	var authUrl = SERVER + "auth";
	return new Promise(function (resolve, reject) {
		$.getJSON(authUrl, function (response) {
			resolve(response.token);
		});
	});
}

function sanitize(input) {
	return input.replace(/\s+/g, "+");
}