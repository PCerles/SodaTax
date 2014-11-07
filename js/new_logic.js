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

var textData = {"07 April": ["First donation", "", ""], "01 August": ["Soda donates first", "level_1", "$300,000"],
				"16 September": ["Soda again", "level_2", "$800,000"], "01 October": ["Who knows", "level_3", "$1,400,000"],
				"15 October": ["huh?", "", "$1,400,000"]}

var width = 200;
var height = 1600;

var baseSoda = $("#g-soda-image"),
	baseWater = $("#g-water-image")
	sodaText = $("#g-soda-tax-text")
	wj = $(window),
	water_amount = $("#water-amount")
	soda_amount = $("#soda-amount")
	marker_line = $("#marker-line")
	imageBaseSoda = $(".g-base-soda");

var chart = d3.select("#chart")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var formatData = function (d) {
  d.Value = +d.Value;
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
		return chartBottom - 517;
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

var imageHeight = 641
	imageWidth = 420
	waterMaxHeight = imageHeight - 141;

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
				top: +hj.attr("transform").slice(12,-1), // THIS IS SO HACKY KILL ME 
				date: hj.text()
	    });
	});
	
	var bar = water.select("rect")
			       .attr("fill", "#33ADFF")
			       .attr("transform", "translate(105, -12)")
			       .attr("opacity", "0.8");

	var waterLevel = d3.scale.linear()
	    .range([imageHeight, waterMaxHeight])
			.domain([0, d3.max(data, function(d){return d.Value})]);

	var imageLoaded = {"level_1": false, "level_2": false, "level_3": false}

	var scrollSpy = function () {
		wtop = wj.scrollTop();
		wmiddle = wj.height() / 2;
		baseSoda.css("top", bottleHeight(wtop - 400));
		baseWater.css("top", bottleHeight(wtop - 400));
		sodaText.css("top", markerHeight(wtop + wmiddle));
		var mark_height = markerHeight(wtop + wmiddle);
		marker_line.css("top", mark_height);

		data.sort(function(a, b) {
			return Math.abs(wtop + wmiddle - y(a.Date) - 509) - Math.abs(wtop + wmiddle - y(b.Date) - 509);
		});

		bar.transition()
			 .duration(50)
			 .attr("y", waterLevel(data[0].Value))
			 .attr("height", imageHeight - waterLevel(data[0].Value));
	    water_amount.text("$" + data[0].Value + " in " + data[0].Donations + " donations");

		tickHeights.forEach(function(d) {
	      d.amount = Math.abs(mark_height - d.top);
	    });
	    // messed up because tick heights are different for soda/non-soda
		if (wtop + wmiddle < chartTop) {
			$(".g-overlays .g-overlay").css("opacity", 0);
			for (var level in imageLoaded) {
				imageLoaded[level] = false;
			}
		}
		tickHeights.sort(function(a, b){ return a.amount - b.amount; });
		console.log(tickHeights[0]);
		var level = textData[tickHeights[0].date][1];
		if (tickHeights[0].amount < 50) {
			if (!imageLoaded[level]) {
				var overlay = $(".g-overlay.g-" + level);
				overlay.children('img').attr("src", overlay.children('img').attr("src") + "?random=" + new Date().getTime());
				overlay.css("opacity", 1);
				imageLoaded[level] = true;
			}
			sodaText.text(textData[tickHeights[0].date][0]);
			soda_amount.text(textData[tickHeights[0].date][2])
		} else {
			sodaText.text("")
		}
	};
	wj.scroll(scrollSpy);
});





