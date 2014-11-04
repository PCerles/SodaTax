/**
Textbox for each milestone appears at each point of the page we have a milestone. At each milestone the soda cans fill up. 
*/

var textData = {"07 April": ["First donation.", "level_1"], "01 August": ["Soda donates first", "level_2"],
				"16 September": ["Soda again", "level_3"], "01 October": ["Who knows", "level_4"],
				"15 October": ["Bloomberg Donates", ""]}

var $j = jQuery;
var baseSoda = $j("#g-soda-image"),
	baseWater = $j("#g-water-image")
	sodaText = $j("#g-soda-tax-text")
	wj = $j(window);
var wtop, ttop, trackHeight, wheight, pct, offsetMax;

var margin = {top: 40, right: 40, bottom: 40, left:100},
    width = 200 - margin.left - margin.right,
    height = 1600 - margin.top - margin.bottom;

var chart = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function type(d) {
  d.Value = +d.Value; // coerce to number
  var non_offset = new Date(d.Date);
  non_offset.setDate(non_offset.getDate() + 1);
  d.Date = non_offset;
  return d;
}

function resize() {
	var baseSodaHeight = baseSoda.height();
	ttop = sodaText.offset().top;
	theight = sodaText.height();
	wheight = wj.height();
	trackHeight = theight - baseSodaHeight;
	offsetMax = theight - wheight;
}

var water = d3.select("#water-level");
resize();

d3.tsv("bev_dates.tsv", type, function(error, data) {
	var y = d3.time.scale()
	 	.domain([d3.time.month.offset(data[0].Date, -1), data[data.length - 1].Date])
	 	.range([0, height]);

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient('right')
	    .tickValues([data[0].Date, new Date(2014, 7, 1), new Date(2014, 8, 16), new Date(2014, 9, 1), new Date(2014, 9, 15)])
	    .tickFormat(d3.time.format('%d %B'));
	chart.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	var tickHeights = [];


	var ticks = $j(".tick");
	ticks.each(function(i, h) {
	    hj = $j(h);
	    tickHeights.push({
	      top: hj.offset().top,
	      date: hj.text(),
	    });
	  });

	wj.scroll(scrollSpy);
	wj.resize(resize);

	var bar = water.select("rect")
			       .attr("fill", "#47D1FF")
			       .attr("transform", "translate(70,-70)");

	var waterLevel = d3.scale.linear()
	    .range([641, 0])
		.domain([0, d3.max(data, function(d){return d.Value})]);

	function scrollSpy() {
		wtop = wj.scrollTop();
		wbottom = wtop + wj.height();
		wmiddle = (wbottom - wtop) / 2;
		console.log(wmiddle);
		baseSoda.css("top", wtop + 150)
		baseWater.css("top", wtop + 150)
		sodaText.css("top", wtop + wmiddle)

		data.sort(function(a, b) {
			return Math.abs(wtop + wmiddle - y(a.Date)) - Math.abs(wtop + wmiddle - y(b.Date));
		});

		bar.transition()
			.attr("y", waterLevel(data[0].Value))
			.attr("height", 641 - waterLevel(data[0].Value));

		tickHeights.forEach(function(d) {
	      d.amount = Math.abs(wtop + wmiddle - d.top);
	    });
	    console.log(tickHeights[0]);
		$j(".g-overlays .g-overlay").css("opacity", 0);
		tickHeights.sort(function(a, b){ return a.amount - b.amount; });
		if (tickHeights[0].amount < 45) {
			sodaText.text(textData[tickHeights[0].date][0]);
			$j(".g-overlay.g-" + textData[tickHeights[0].date][1]).css("opacity", 1);
      		//$j(".g-overlay.g-" + textData[tickHeights[0].date][1]).play()
		} else {
			sodaText.text("")
		}

		/**
		water
			.data(data)
			.attr("fill", "#fdcdac");*/
		/**
		$j(".g-overlay.g-" + textData[tickHeights[0].date][1]).css("opacity", 1);*/		
	}
});
