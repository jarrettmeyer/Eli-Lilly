const stockDataUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&apikey=LZ1DB89RRLZ57PUU&outputsize=full";

const svg = d3.select("svg");
const svgWidth = parseFloat(svg.style('width'));
const svgHeight = parseFloat(svg.style("height"));

var innerHeight;
var innerWidth;

if (svgHeight <500) {
	innerHeight = 450;
} else {
	innerHeight = svgHeight - 50;
}

if (svgWidth < 500) {
	innerWidth = 450;
} else {
	innerWidth = svgWidth - 100;
}

document.getElementById('userInput').addEventListener('submit', function(event) {
	event.preventDefault();
	event.stopPropagation();
	var formData = new FormData(this);

var tickerSymbol = formData.get("tickersymbol");

if (!tickerSymbol) {
	return false
}

/*clearing all pre-exisiting data*/
svg.html("")
d3.selectAll(".symbol-info")
	.style('opacity', 0)

/*fetching data for new tickr symbol*/
fetch(stockDataUrl+"&symbol="+tickerSymbol)
.then(response => {
    if (!response.ok) {
    	alert("Unable to fetch data for the symbol");
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
.then(data =>  {
	let metadata = data["Meta Data"];

	document.getElementById("symbolValue").innerHTML = metadata["2. Symbol"];
	document.getElementById("lastRefreshedValue").innerHTML = metadata["3. Last Refreshed"];
	document.getElementById("intervalValue").innerHTML = metadata["4. Interval"];
	document.getElementById("timezoneValue").innerHTML = metadata["6. Time Zone"];

	let timeSeries = data["Time Series (1min)"];
	
	var endDateTime = new Date();
	var startDateTime = endDateTime.getDate()-1;

	let allTimestamps = Object.keys(timeSeries);

	var xAxisData = [];
	var yAxisData = [];
	var lineData = [];

	for(var i = 0; i < allTimestamps.length; i++) {
		let currentDateTime = Date.parse(allTimestamps[i]);
		if (currentDateTime >= startDateTime && currentDateTime <= endDateTime) {
			
			xAxisData.push(currentDateTime);
					
			var tradeValues = timeSeries[allTimestamps[i]];
			var closingTradeValue = +tradeValues["4. close"];
			yAxisData.push(closingTradeValue);

			lineData.push({"timestamp": currentDateTime, "value": tradeValues});

		}
	}

	/*Plotting x Axis*/
	const yTransform = innerHeight + 10;
	const xScale = d3.scaleTime().domain([d3.min(xAxisData), d3.max(xAxisData)]).range([0, innerWidth]).nice();
	const xAxis = d3.axisBottom(xScale).ticks(9);

	svg.append("g").attr('transform', `translate(50, ${yTransform})`).call(xAxis);

	/*Plotting Y Axis*/
	const yScale = d3.scaleLinear().domain([d3.min(yAxisData) - 10, d3.max(yAxisData) + 2]).range([innerHeight, 0]).nice();
	const yAxis = d3.axisLeft(yScale).ticks(5);
	svg.append("g")
		.attr('transform', `translate(50, 10)`)
		.call(yAxis);

	/*Prepare grid*/
	var lineGroup = svg.append("g").attr('transform', `translate(50, 10)`).attr("class", "grid-container");
	
	var tooltipHandler = function(event) {
		event.currentTarget.setAttribute("stroke", "black");
		
		for(var j=0; j < lineData.length; j++) {

			if (lineData[j]["timestamp"] == event.currentTarget.getAttribute("x-axis-data")) {
				document.getElementById("openTradeValue").innerHTML = lineData[j]["value"]["1. open"];
				document.getElementById("highTradeValue").innerHTML = lineData[j]["value"]["2. high"];
				document.getElementById("lowTradeValue").innerHTML = lineData[j]["value"]["3. low"];
				document.getElementById("closeTradeValue").innerHTML = lineData[j]["value"]["4. close"];
				document.getElementById("volumeTradeValue").innerHTML = lineData[j]["value"]["5. volume"];
			}
		}
	}

	for (var i=0; i < xAxisData.length; i++) {

		lineGroup.append("line")
			.attr("x1", xScale(xAxisData[i]))
			.attr("x2", xScale(xAxisData[i]))
			.attr("y1", yScale(d3.min(yAxisData)-10))
			.attr("y2", yScale(d3.max(yAxisData)+2))
			.attr("x-axis-data", xAxisData[i])
			.attr("stroke", "#f0f0f0")
			.on("mouseout", function(event) {
				event.currentTarget.setAttribute("stroke", "#f0f0f0");
			})
			.on("mouseover", tooltipHandler)
			.on("mousemove", tooltipHandler);
	}

	/*to show the symbol-info*/
	d3.selectAll(".symbol-info")
	.style('opacity', 0.75)

	/*Prepare line generator*/
	var lineGenerator = d3.line()
		.x(function(d) { return xScale(d.timestamp); })
		.y(function(d) { return yScale(d.value["4. close"]); });

	svg.append("g")
		.attr('transform', `translate(50, 10)`)
		.attr("class", "line-chart")
		.append("path")
		.attr("d", lineGenerator(lineData))
		.style("fill", "none")
		.style('stroke-width', '1px');
});
	return false;
})

