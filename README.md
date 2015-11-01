# citegraph
development for legal citation display

Install nodejs

```
npm install -g eslint yo
npm install
bower install

grunt
grunt watch
grunt test
grunt server
grunt build
grunt eslint

#To Do

 [x] use short format data in JSON

 [] fix y distribution to be adaptive again

 [x] Integrate all visualizations
	keep original page JSON
	separate out preparsing of JSON
		handle links set to not visible in JSON? just don't process if invisible, or process and allow to be edited back to visible?

	pass prepared (displayed) JSON out to table generation

 [x] chronological v categorical toggle (toggle or setting? toggle implies interactive, setting is a redraw)

 [x] click opens case, in view mode - keep edit mode different - fixed so right url is present in table
	what mode are we in view or edit

 [x] table sortable
	hide id

 [] toggle case names shown

 [x] make date format on x axis more dynamic

 [] curved lines
	look into subclassing line graph?

store toggle states and integrate with # chart selection

DoS dropdown (or interface) needs to be dynamic
