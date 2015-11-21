/* global $, document, d3*/

'use strict';

var opinions = {};

$(document).ready(function () {
	function loadJSON(startup) {
		var JSONpath = $('#dataSourceSelect').val();

		// for courtlistener unwrap this json call
		d3.json('/JSON/' + JSONpath + '.json', function (error, json) {
			if (error) {
				return console.warn(error);
			}
			opinions = json;
			if (startup) {
				d3.select('body')
					.append('script')
					.attr('src', '/scripts/scotus_map.js');
			}
		});
	}

	$('#dataSourceSelect').change(function () {
		loadJSON(false);
	});

	loadJSON(true);
});
