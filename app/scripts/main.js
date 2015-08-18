/* global $, document, d3, Plottable*/
/*eslint browser:true*/

'use strict';

var citationJSON = {};

function drawGraph() {
	var parseDate = {},
		xScale = {},
		yScale = {},
		sizeScale = {},
		colorScale = {},
		xAxis = {},
		yAxis = {},
		xLabel = {},
		yLabel = {},
		legend = {},
		cases = {},
		connections = {},
		coords = {},
		point = {},
		plot = {},
		caseHover = {},
		defaultCaseHoverText = '',
		caseHoverText = {},
		caseHoverGroup = {},
		caseClick = {},
		//connectionHover
		table = [],
		chart = {};

	d3.select('#chart')
	.append('svg')
	.attr('id', 'coverageChart')
	.attr('height', '400px');

	parseDate = d3.time.format('%Y-%m-%dT%H:%M:%S').parse;

	xScale = new Plottable.Scales.Time();
	yScale = new Plottable.Scales.Linear();
	sizeScale = new Plottable.Scales.ModifiedLog();
	sizeScale.range([5,25]);
	colorScale = new Plottable.Scales.Color();

	xAxis = new Plottable.Axes.Time(xScale, 'bottom');
	xLabel = new Plottable.Components.AxisLabel('Time', 0);
	yAxis = new Plottable.Axes.Numeric(yScale, 'left');
	yLabel = new Plottable.Components.AxisLabel('Court Leaning', -90);

	legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(5);

	plot = new Plottable.Components.Group();

	connections = new Plottable.Plots.Line()
		.x(function (d) {
			return parseDate(d.x);
		}, xScale)
		.y(function (d) {
			return d.y;
		}, yScale)
		.attr('stroke', colorScale.scale('Connector'));
	plot.append(connections);

	citationJSON.opinion_clusters.forEach(function (cluster) {
		point = {};
		point.date_filed = cluster.date_filed;
		point.citation_count = cluster.citation_count;
		coords[cluster.id] = point;
	});

	citationJSON.opinion_clusters.forEach(function (cluster) {
		cluster.sub_opinions[0].opinions_cited.forEach(function (id) {
			connections.addDataset(new Plottable.Dataset([
				{x: coords[cluster.id].date_filed, y: coords[cluster.id].citation_count},
				{x: coords[id].date_filed, y: coords[id].citation_count}
			]));
		});
	});

	cases = new Plottable.Plots.Scatter()
		.addDataset(new Plottable.Dataset(citationJSON.opinion_clusters))
		.addClass('caseScatter')
		.x(function (d) {
			return parseDate(d.date_filed);
		}, xScale)
		.y(function (d) {
			return d.citation_count;
		}, yScale)
		.size(function (d) {
			return d.citation_count;
		}, sizeScale)
		.attr('stroke', colorScale.scale('Case'))
		.attr('fill', colorScale.scale('Case'))
		.attr('title', function (d) {
			return d.case_name;
		});
	plot.append(cases);

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
		.style('visibility', 'hidden')
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
		var datum,
			position;

		if (typeof cases.entityNearest === 'function') {
			var nearestEntity = cases.entityNearest(p);

			if (nearestEntity != null) {
				datum = nearestEntity.datum;
				position = nearestEntity.position;
			}
		} else {
			var cpd = cases.getClosestPlotData(p);
			if (cpd.data.length > 0) {
				datum = cpd.data[0];
				position = cpd.pixelPoints[0];
			}
		}
		if (datum != null) {
			caseHoverText.text(datum.case_name_short);
			caseHoverGroup
				.attr('transform', 'translate(' + position.x + ',' + position.y + ')')
				.style('visibility', 'visible');
		} else {
			caseHoverText.text(defaultCaseHoverText);
			caseHoverGroup.style('visibility', 'hidden');
		}
	});
	caseHover.onPointerExit(function() {
		caseHoverText.text(defaultCaseHoverText);
		caseHoverGroup.style('visibility', 'hidden');
	});
	caseHover.attachTo(cases);

	caseClick = new Plottable.Interactions.Click();

	caseClick.onClick(function (c) {
		var datum;

		if (typeof cases.entityNearest === 'function') {
			var nearestEntity = cases.entityNearest(c);

			if (nearestEntity != null) {
				datum = nearestEntity.datum;
			}
		} else {
			var cpd = cases.getClosestPlotData(c);
			if (cpd.data.length > 0) {
				datum = cpd.data[0];
			}
		}
		if (datum != null) {
			console.log(datum.absolute_url);
		}
	});

	caseClick.attachTo(cases);

}

$(document).ready(function() {
	// on select JSON in the data and then call drawGraph()
	$('#dataSourceSelect').change(function (e) {
		var JSONpath = $('#dataSourceSelect').val();
		d3.json('/JSON/' + JSONpath + '.json', function(error, json) {
			if (error) return console.warn(error);
			citationJSON = json;
			drawGraph();
		});
	});
});
