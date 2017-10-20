const MAX_RELATED_ARTISTS = 5;
const MAX_SEARCH_DEPTH = 4;
const ENTER_KEY = 13;
const SERVER = "http://18.221.74.204:3001/";
var artistNameIdMap = {};

$(document).ready(function () {
	// $("#submit").click(submit);

	// $("#artist-b-input").keypress(function (event) {
	// 	if(event.which === ENTER_KEY) {
	// 		submit();
	// 	}
	// });

	$("#artist-a-input").keyup(updateArtistASuggestions);

	$("#artist-b-input").keyup(updateArtistBSuggestions);
});

function submit($scope) {
	$("#connection-output-error").text("");
	var artistA = artistNameIdMap[$("#artist-a-input").val()];
	var artistB = artistNameIdMap[$("#artist-b-input").val()];
	if(artistA !== undefined && artistB !== undefined) {
		var connections = {};
		connections[artistA] = undefined;
		getConnections([artistA], artistB, connections, 0).then(function (result) {
			if(result.common !== undefined) {
				connections = result.connections;
				var current = result.common;
				var artists = [];
				while(current !== undefined) {
					console.log(current);
					artists.push(current);
					current = connections[current];
				}
				updateArtists($scope, artists.reverse());
			} else {
				$("#connection-output-error").text("These artists aren't connected within " + MAX_SEARCH_DEPTH + " levels of related artists.");
			}
		});
	} else {
		$("#connection-output-error").text("Something weird happened. I don't have a Spotify id for one or both of those artists.");
	}
}

function updateArtists($scope, artistIds) {
	$scope.artists = [];
	var promises = [];
	artistIds.forEach(function (artistId) {
		promises.push(getArtist(artistId));
	});
	Promise.all(promises).then(function (artists) {
		artists.forEach(function (artist) {
			$scope.artists.push(artist);
		});
	});
	$("#pseudo-body").focus();
}

function getConnections(fromArtists, toArtist, connections, depth) {
	console.log(fromArtists);
	console.log(toArtist);
	console.log(connections);
	console.log(depth);
	if (depth < MAX_SEARCH_DEPTH) {
		var promises = [];
		fromArtists.forEach(function (fromArtist) {
			promises.push(getRelatedArtists(fromArtist));
		});
		return Promise.all(promises).then(function (values) {
			artistsAtDepth = [];
			values.forEach(function (relatedArtists, index) {
				relatedArtists.forEach(function (relatedArtist) {
					if(artistsAtDepth.indexOf(relatedArtist) === -1) {
						artistsAtDepth.push(relatedArtist);
					}
					if(!connections.hasOwnProperty(relatedArtist)) {
						connections[relatedArtist] = fromArtists[index];
					}
				});
			});
			for(var i = 0; i < artistsAtDepth.length; i++) {
				var fromArtist = artistsAtDepth[i];
				if (fromArtist === toArtist) {
					return {
						common: fromArtist,
						connections: connections
					};
				}
			}
			return getConnections(artistsAtDepth, toArtist, connections, depth + 1);
		});	
	}
	return new Promise(function (resolve, reject) {
		resolve({
			common: undefined,
			connections: undefined
		});
	});
}

function getArtist(artistId) {
	var artistUrl = "https://api.spotify.com/v1/artists/" + artistId;
	return authenticate().then(function (token) {
		return new Promise(function (resolve, reject) {
			$.ajax(artistUrl, {
				headers: {"Authorization": "Bearer " + token},
				success: function (response) {
					resolve({
						name: response.name,
						image: response.images[0].url
					});
				}
			});
		});
	});
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
					});
					artists = artists.map(function (artist) {
						return artist.id;
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
		return new Promise(function (resolve, reject) {
			resolve([]);
		});
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

var app = angular.module('app', []);
app.controller("mainCtrl", function ($scope) {
	$scope.artists = [];
	$scope.submit = function (artistForm) {
		$scope.artists = [];
		submit($scope);
		artistForm.from = "";
		artistForm.to = "";
	};
});
app.directive("artist", function () {
	return {
		scope: {
			artist: "=" // Get an object from the user property
		},
		restrict: "E", // Use directive as element
		replace: "true",
		template: (
			"<div class='Artist'>" +
				"<img ng-src='{{artist.image}}'/>" +
        		"<h3>{{artist.name}}</h3>" + 
      		"</div>"
  		)
	};
});