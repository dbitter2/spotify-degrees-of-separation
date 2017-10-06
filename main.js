$(document).ready(function () {
	$("#submit").click(submit);

	$("#artist-b-input").keypress(function (event) {
		if(event.which === 13) {
			submit();
		}
	});

	$("#artist-a-input").keyup(suggestArtistsForA);

	$("#artist-b-input").keyup(suggestArtistsForB);
});

function submit() {
	console.log("submit");
}

function suggestArtistsForA() {
	console.log("suggestionsForA");
}

function suggestArtistsForB() {
	console.log("suggestionsForB");
}