/**
Textbox for each milestone appears at each point of the page we have a milestone. At each milestone the soda cans fill up. 
*/

// how can you move this textData out of file?
// consider resizing the can and blue bar so you can see the bottom & top
// stop scrolling at a certain height
// keep text on left
// move text to the center of the space ----> css
// highlight the date. keep the differences between dates small enough to be able to see where you are in the timeline
// the blue bar resizing is slow. why?
// did that resize function do anything?
// why does it not work on first load?

var textData = {"07 April": ["First donation.", "level_1"], "01 August": ["Soda donates first", "level_2"],
				"16 September": ["Soda again", "level_3"], "01 October": ["Who knows", "level_4"],
				"15 October": ["huh?", ""]}

var width = 200;
var height = 1600;

var baseSoda = $("#g-soda-image"),
	baseWater = $("#g-water-image")
	sodaText = $("#g-soda-tax-text")
	wj = $(window),
	water_amount = $("#water-amount");

var chart = d3.select("#chart")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var formatData = function (d) {
	// Note, some dates have multiple entries. consider just formatting them so you take the largest of those dates?
  d.Value = +d.Value; // coerce to number
  var non_offset = new Date(d.Date);
  non_offset.setDate(non_offset.getDate() + 1);
  d.Date = non_offset;
  return d;
}

var water = d3.select("#water-level");

d3.tsv("../data/bev_dates.tsv", formatData, function(error, data) {

	for (var i = 0; i < data.length; i++) {
    	data[i].donationNum = i;
    }

	var y = d3.time.scale()
	 	.domain([d3.time.month.offset(data[0].Date, -1), data[data.length - 1].Date])
	 	.range([0, height]);

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient('right')
	    .tickValues([data[0].Date, new Date(2014, 7, 1), new Date(2014, 8, 16), new Date(2014, 9, 1), new Date(2014, 9, 15)])
	    .tickFormat(d3.time.format('%d %B'));
	// tick values shouldn't be hardcoded..?
	var tickHeights = [];

	chart.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)

	var ticks = $(".tick");
	ticks.each(function(i, h) {
	    hj = $(h);
	    tickHeights.push({
				top: hj.offset().top,
				date: hj.text()
	    });
	});

	var bar = water.select("rect")
			       .attr("fill", "#47D1FF")
			       .attr("transform", "translate(75, 0)")

	var waterLevel = d3.scale.linear()
	    .range([641, 0])
			.domain([0, d3.max(data, function(d){return d.Value})]);

	var scrollSpy = function () {
		wtop = wj.scrollTop();
		wbottom = wtop + wj.height();
		wmiddle = (wbottom - wtop) / 2;
		baseSoda.css("top", wtop + 50)
		baseWater.css("top", wtop + 50)
		sodaText.css("top", wtop + wmiddle)

		data.sort(function(a, b) {
			return Math.abs(wtop + wmiddle - y(a.Date)) - Math.abs(wtop + wmiddle - y(b.Date));
		});

		bar.attr("y", waterLevel(data[0].Value))
			 .attr("height", 641 - waterLevel(data[0].Value));
	    water_amount.text("$" + data[0].Value + " in " + data[0].donationNum + " donations.");

		tickHeights.forEach(function(d) {
	      d.amount = Math.abs(wtop + wmiddle - d.top);
	    });

		$(".g-overlays .g-overlay").css("opacity", 0);
		tickHeights.sort(function(a, b){ return a.amount - b.amount; });
		if (tickHeights[0].amount < 50) {
			sodaText.text(textData[tickHeights[0].date][0]);
			$(".g-overlay.g-" + textData[tickHeights[0].date][1]).css("opacity", 1);
      		//$(".g-overlay.g-" + textData[tickHeights[0].date][1]).play()
		} else {
			sodaText.text("")
		}

		/**
		water
			.data(data)
			.attr("fill", "#fdcdac");*/
		/**
		$(".g-overlay.g-" + textData[tickHeights[0].date][1]).css("opacity", 1);*/		
	};

	wj.scroll(scrollSpy);
});
