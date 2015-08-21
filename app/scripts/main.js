/* global $, document, d3, Plottable*/

'use strict';

var citationJSON = {};

function drawGraph() {
	var parseDate = {}, // to parse dates in the JSON into d3 dates
		xDate = {},
		xScale = {}, // the scaling function for x
		yScale = {}, // the scaling function for y
		sizeScale = {}, // the scale used to size the case circles
		colorScale = {}, // the scale used to keep the colors for the degrees of separation
		degrees = ['zeroeth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'distant'],
		thisDegree = 0,
		maxDegree = 0,
		xAxis = {}, // the x axis
		yAxis = {}, // the y axis
		xLabel = {}, // label for the x axis
		yLabel = {}, // label for the y axis
		legend = {}, // chart legend, in this case showing the different colors for degrees of separation
		cases = {}, // reference to the case circles used to attach interactions
		caseCount = 0,
		flagSize = 0,
		flagIndex = 1,
		inputArray = [],
		permutations = [],
		distribution = [], // will hold the correctly sized vertical distribution pattern
		difference = 0,
		pickMin = 0,
		pickTotal = 0,
		pickSize = 0,
		pickMinGap = 0,
		connections = {}, // reference to the connection lines used to attach interactions
		coords = {}, // object to hold extracted coordinates keyed by case id
		point = {}, // a point within coords
		plot = {}, // the plot area of the chart
		caseHover = {}, // interaction behavior
		defaultCaseHoverText = '',
		caseHoverText = {}, // reference to the text in the object shown when hovering
		caseHoverGroup = {}, // reference to the hover show object
		caseClick = {}, // interaction behavior
		//connectionHover
		table = [], // holds the structure of the chart
		chart = {}; // the chart itself

	parseDate = d3.time.format('%Y-%m-%dT%H:%M:%S').parse;
	xDate = d3.time.format('%b-%Y');

	citationJSON.opinion_clusters.sort(function (a, b) {
		if (parseDate(a.date_filed) > parseDate(b.date_filed)) {
			return 1;
		}
		if (parseDate(a.date_filed) < parseDate(b.date_filed)) {
			return -1;
		}
		// a must be equal to b
		return 0;
	});

	caseCount = citationJSON.opinion_clusters.length;

	flagSize = Math.ceil(Math.sqrt(caseCount));

	inputArray = d3.range(1, flagSize + 1);

	permutations = inputArray.reduce(function permute(res, item, key, arr) {
		return res.concat(arr.length > 1 && arr.slice(0, key).concat(arr.slice(key + 1)).reduce(permute, []).map(function(perm) {
			return [item].concat(perm);
		}) || item);
	}, []);

	permutations.forEach(function (item) {
		pickTotal = 0;
		pickMin = Infinity;
		item.forEach(function (part, partNum) {
			if (partNum === 0) {
				difference = Math.abs(part - item[item.length - 1]);
			} else {
				difference = Math.abs(part - item[partNum - 1]);
			}
			if (pickMin > difference) {
				pickMin = difference;
			}
			pickTotal += difference;
		});
		console.log(item, pickSize, pickTotal, pickMinGap, pickMin);
		if (pickTotal >= pickSize && pickMin > pickMinGap) {
			pickSize = pickTotal;
			pickMinGap = pickMin;
			distribution = item;
			console.log('***')
		}
	});

	// d3.select('#chart')
	// 	.append('p')
	// 	.text(JSON.stringify(permutations));
	d3.select('#chart')
		.append('p')
		.text(JSON.stringify(distribution) + ' ' + pickSize+ ' ' + pickMinGap);

//

	citationJSON.opinion_clusters.forEach(function (cluster) {
		if (flagIndex === 1 || flagIndex === caseCount) {
			cluster.order = degrees[0];
		} else {
			// get degrees of separation count
			thisDegree = 1;
			// if over 7 then 8
			if (thisDegree > 7) {
				thisDegree = 8;
			}
			// translate it
			cluster.order = degrees[thisDegree];
			if (thisDegree > maxDegree) {
				maxDegree = thisDegree;
			}
		}
		cluster.count = flagIndex++;
	});

	d3.select('#chart')
		.append('svg')
		.attr('id', 'coverageChart')
		.attr('height', '400px');

	xScale = new Plottable.Scales.Category(); // set switch for time or category time
	yScale = new Plottable.Scales.Category();
	yScale.domain(d3.range(flagSize));

	sizeScale = new Plottable.Scales.ModifiedLog();
	sizeScale.range([5, 25]);
	colorScale = new Plottable.Scales.Color();
	colorScale.domain(degrees.slice(0, maxDegree + 1));

	xAxis = new Plottable.Axes.Category(xScale, 'bottom');
	xAxis.tickLabelAngle(-90)
		.formatter(function (d) {
			return xDate(d);
		});

	xLabel = new Plottable.Components.AxisLabel('Time', 0);
	yAxis = new Plottable.Axes.Category(yScale, 'left');
	// yAxis.formatter(function () {
	// 	return '';
	// });

	yLabel = new Plottable.Components.AxisLabel('Random', -90);

	legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(4);

	plot = new Plottable.Components.Group();

	cases = new Plottable.Plots.Scatter()
		.addDataset(new Plottable.Dataset(citationJSON.opinion_clusters))
		.addClass('caseScatter')
		.x(function (d) {
			return parseDate(d.date_filed);
		}, xScale)
		.y(function (d) {
			return distribution[(d.count - 1) % flagSize];
		}, yScale)
		.size(function (d) {
			return d.citation_count;
		}, sizeScale)
		.attr('stroke', function (d) {
			return colorScale.scale(d.order);
		})
		.attr('fill', function (d) {
			return colorScale.scale(d.order);
		})
		.attr('title', function (d) {
			return d.case_name;
		});
	plot.append(cases);

	connections = new Plottable.Plots.Line()
		.x(function (d) {
			return parseDate(d.x);
		}, xScale)
		.y(function (d) {
			return d.y;
		}, yScale)
		.attr('stroke', function (d) {
			return colorScale.scale(d.c);
		})
		.attr('opacity', 0.5);
	plot.append(connections);

	citationJSON.opinion_clusters.forEach(function (cluster) {
		point = {};
		point.date_filed = cluster.date_filed;
		point.count = distribution[(cluster.count - 1) % flagSize];
		point.order = cluster.order;
		coords[cluster.id] = point;
	});

	citationJSON.opinion_clusters.forEach(function (cluster) {
		cluster.sub_opinions[0].opinions_cited.forEach(function (id) {
			connections.addDataset(new Plottable.Dataset([
				{x: coords[cluster.id].date_filed, y: coords[cluster.id].count, c: coords[cluster.id].order},
				{x: coords[id].date_filed, y: coords[id].count, c: coords[id].order}
			]));
		});
	});

	table = [
		[null, null, legend],
		[yLabel, yAxis, plot],
		[null, null, xAxis],
		[null, null, xLabel]
	];

	chart = new Plottable.Components.Table(table);

	chart.renderTo('#coverageChart');

	caseHover = new Plottable.Interactions.Pointer();

	caseHoverGroup = cases
		.foreground()
		.append('g')
		.attr('transform', 'translate(0,0)')
		.style('visibility', 'hidden');
	caseHoverGroup
		.append('circle')
		.attr({
			'stroke': 'black',
			'fill': 'none',
			'r': 15,
			'cx': 0,
			'cy': 0
		});
	caseHoverText = caseHoverGroup
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(0,-17)')
		.text(defaultCaseHoverText);

	caseHover.onPointerMove(function (p) {
		var datum = null,
			position = null,
			nearestEntity = null,
			cpd = null;

		if (typeof cases.entityNearest === 'function') {
			nearestEntity = cases.entityNearest(p);
			if (nearestEntity !== null) {
				datum = nearestEntity.datum;
				position = nearestEntity.position;
			}
		} else {
			cpd = cases.getClosestPlotData(p);
			if (cpd.data.length > 0) {
				datum = cpd.data[0];
				position = cpd.pixelPoints[0];
			}
		}
		if (datum !== null) {
			caseHoverText.text(datum.case_name_short);
			caseHoverGroup
				.attr('transform', 'translate(' + position.x + ',' + position.y + ')')
				.style('visibility', 'visible');
		} else {
			caseHoverText.text(defaultCaseHoverText);
			caseHoverGroup.style('visibility', 'hidden');
		}
	});
	caseHover.onPointerExit(function () {
		caseHoverText.text(defaultCaseHoverText);
		caseHoverGroup.style('visibility', 'hidden');
	});
	caseHover.attachTo(cases);

	caseClick = new Plottable.Interactions.Click();

	caseClick.onClick(function (c) {
		var datum = null,
			nearestEntity = null,
			cpd = null;

		if (typeof cases.entityNearest === 'function') {
			nearestEntity = cases.entityNearest(c);

			if (nearestEntity !== null) {
				datum = nearestEntity.datum;
			}
		} else {
			cpd = cases.getClosestPlotData(c);
			if (cpd.data.length > 0) {
				datum = cpd.data[0];
			}
		}
		if (datum !== null) {
			console.log(datum.absolute_url);
		}
	});

	caseClick.attachTo(cases);

}

$(document).ready(function () {
	// on select JSON in the data and then call drawGraph()
	$('#dataSourceSelect').change(function () {
		var JSONpath = $('#dataSourceSelect').val();

		d3.json('/JSON/' + JSONpath + '.json', function (error, json) {
			if (error) {
				return console.warn(error);
			}
			citationJSON = json;
			d3.select('#chart').select('svg').remove();
			drawGraph();
		});
	});
});
