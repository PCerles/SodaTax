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

var textData = {"07 April": ["First donation", ""], "01 August": ["Soda donates first", "level_1"],
				"16 September": ["Soda again", "level_2"], "01 October": ["Who knows", "level_3"],
				"15 October": ["huh?", ""]}

var width = 200;
var height = 1600;

var baseSoda = $("#g-soda-image"),
	baseWater = $("#g-water-image")
	sodaText = $("#g-soda-tax-text")
	wj = $(window),
	water_amount = $("#water-amount")
	marker_line = $("#marker-line")
	imageBaseSoda = $(".g-base-soda");

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
  d.Donations = +d.Donations;
  return d;
}
/**
var formatCurrency = function(value) {
	// 1230 -> 1,230
	// 23000 -> 23,000
	// 230000 -> 230,000
	var s = value.toString();
	if s.length() > 3:
		s = s.slice(-3);
} */

var water = d3.select("#water-level");

var chartSlider = $("#chart-and-slider");
var offset = chartSlider.offset();
var chartTop = offset.top;
var chartBottom = chartTop + chartSlider.height();

function markerHeight(height) {
	if (height < chartBottom ) {
		if (height < chartTop) {
			return 0;
		} else {
			return height - 509;
		}
	} else {
		return chartBottom - 509;
	}
}

function bottleHeight(height) {
	if (height < 0) {
		return 0;
	} else if (height > chartBottom) {
		return chartBottom;
	} else {
		return height;
	}
}

d3.tsv("../data/bev_dates.tsv", formatData, function(error, data) {

	var y = d3.time.scale()
	 	.domain([d3.time.month.offset(data[0].Date, -1), data[data.length - 1].Date])
	 	.range([0, height]);

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient('right')
	    .tickValues([data[0].Date, new Date(2014, 7, 1), new Date(2014, 8, 16), new Date(2014, 9, 1), new Date(2014, 9, 15)])
	    .tickFormat(d3.time.format('%d %B'));
	var tickHeights = [];

	chart.append("g")
	    .attr("class", "y axis")
	    .call(yAxis);

	var ticks = $(".tick");
	ticks.each(function(i, h) {
	    hj = $(h);
	    tickHeights.push({
				top: hj.offset().top,
				date: hj.text()
	    });
	});

	var bar = water.select("rect")
			       .attr("fill", "#33ADFF")
			       .attr("transform", "translate(105, -12)")
			       .attr("opacity", "0.8");

	var waterLevel = d3.scale.linear()
	    .range([641, 500])
			.domain([0, d3.max(data, function(d){return d.Value})]);

	var scrollSpy = function () {
		wtop = wj.scrollTop();
		wbottom = wtop + wj.height();
		wmiddle = (wbottom - wtop) / 2;
		baseSoda.css("top", bottleHeight(wtop - 400));
		baseWater.css("top", bottleHeight(wtop - 400));
		sodaText.css("top", wtop + wmiddle - 509);
		marker_line.css("top", markerHeight(wtop + wmiddle));

		data.sort(function(a, b) {
			return Math.abs(wtop + wmiddle - y(a.Date) - 509) - Math.abs(wtop + wmiddle - y(b.Date) - 509);
		});

		bar.transition()
			 .duration(50)
			 .attr("y", waterLevel(data[0].Value))
			 .attr("height", 641 - waterLevel(data[0].Value));
	    water_amount.text("$" + data[0].Value + " in " + data[0].Donations + " donations");

		tickHeights.forEach(function(d) {
	      d.amount = Math.abs(wtop + wmiddle - d.top);
	    });
	    // messed up because tick heights are different for soda/non-soda
		if (wtop + wmiddle < d3.min(tickHeights, function(d) {return d.top})) {
			$(".g-overlays .g-overlay").css("opacity", 0);
		}
		tickHeights.sort(function(a, b){ return a.amount - b.amount; });
		if (tickHeights[0].amount < 50) {
			sodaText.text(textData[tickHeights[0].date][0]);
			var overlay = $(".g-overlay.g-" + textData[tickHeights[0].date][1]);
			overlay.css("opacity", 1);
			//overlay.css("top", baseSoda.attr("height") - overlay.attr("height"));
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
