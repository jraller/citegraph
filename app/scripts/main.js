/* global $, document, d3, Plottable, citationJSON*/
/*eslint browser:true*/

'use strict';

function drawGraph() {
	var parseDate = {},
		xScale = {},
		yScale = {},
		colorScale = {},
		xAxis = {},
		yAxis = {},
		xLabel = {},
		yLabel = {},
		legend = {},
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
	colorScale = new Plottable.Scales.Color();

	xAxis = new Plottable.Axes.Time(xScale, 'bottom');
	xLabel = new Plottable.Components.AxisLabel('Time', 0);
	yAxis = new Plottable.Axes.Numeric(yScale, 'left');
	yLabel = new Plottable.Components.AxisLabel('Court Leaning', -90);

	legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(5);

	plot = new Plottable.Components.Group();

	plot.append(new Plottable.Plots.Scatter()
		.addDataset(new Plottable.Dataset(citationJSON.opinion_clusters))
		.x(function (d) {
			return parseDate(d.date_filed);
		}, xScale)
		.y(function (d) {
			return d.citation_count;
		}, yScale)
		.size(function (d) {
			return d.citation_count;
		}, yScale)
		.attr('stroke', colorScale.scale('Case'))
	);

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
