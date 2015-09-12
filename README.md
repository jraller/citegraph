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

fix y distribution to be adaptive again

Integrate all visualizations
	keep original page JSON
	separate out preparsing of JSON
		handle links set to not visible in JSON? just don't process if invisible, or process and allow to be edited back to visible?

	pass prepared (displayed) JSON out to table generation

chronological v categorical toggle (toggle or setting? toggle implies interactive, setting is a redraw)

click opens case, in view mode - keep edit mode different
	what mode are we in view or edit

table sortable
	hide id
	sort on case name
	sort on degree of separation
	sort on all

toggle case names shown

make date format on x axis more dynamic

curved lines
	look into subclassing line graph?

store toggle states and integrate with # chart selection

DoS dropdown (or interface) needs to be dynamic
