/* global $, document, d3, Plottable, citationJSON*/
/*eslint browser:true*/

'use strict';

if (typeof citationJSON != 'undefined') {

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
		yLabel = new Plottable.Components.AxisLabel('Court GLeaning', -90);

		legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(5);

		plot = new Plottable.Components.Group();

		cases = new Plottable.Plots.Scatter()
			.addDataset(new Plottable.Dataset(citationJSON.opinion_clusters))
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
		plot.append(cases);

		connections = new Plottable.Plots.Line()
			.x(function (d) {
				return parseDate(d.x);
			}, xScale)
			.y(function (d) {
				return d.y;
			}, yScale)
			.attr('stroke', colorScale.scale('Connector'))
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

		table = [
			[null, null, legend],
			[yLabel, yAxis, plot],
			[null, null, xAxis],
			[null, null, xLabel]
		];

		chart = new Plottable.Components.Table(table);

		chart.renderTo('#coverageChart');

	}

	$(document).ready(function() {
		drawGraph();
	});
}
