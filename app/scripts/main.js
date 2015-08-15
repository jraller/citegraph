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

	parseDate = d3.time.format('%m%d%Y').parse;

	xScale = new Plottable.Scales.Time();
	yScale = new Plottable.Scales.Category();
	colorScale = new Plottable.Scales.Color();

	xAxis = new Plottable.Axes.Time(xScale, 'bottom');
	xLabel = new Plottable.Components.AxisLabel('Time', 0);
	yAxis = new Plottable.Axes.Category(yScale, 'left');
	yLabel = new Plottable.Components.AxisLabel('Court Leaning', -90);

	legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(5);

	plot = new Plottable.Components.Group();

	plot.append(new Plottable.Plots.Line()
		.addDataset(new Plottable.Dataset(citationJSON.opinion_clusters))
		.x(function (d) {
			return parseDate(d.date_filed);
		}, xScale)
		.y(function (d) {
			return d.citation_count;
		}, yScale)
		.attr('stroke', colorScale.scale('Inflation'))
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
