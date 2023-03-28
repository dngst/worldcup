async function drawChart() {
  // access data
  const dataset = await d3.tsv("world_cup_geo.tsv")

  const yAccessor = d => +d.attendance
  const xAccessor = d => d.year

  // create chart dimensions
  const width = 900
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 60
    }
  }

  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // draw canvas
  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  let bounds = wrapper.append("g")
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)

  // create scales
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  // draw data
  const dots = bounds.selectAll("circle")
    .data(dataset)
    .enter().append("circle")
      .on("mouseenter", onMouseEnter)
      .on("mousemove", onMouseMove)
      .on("mouseleave", onMouseLeave)
      .attr("class", "dot")
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", dimensions.boundedHeight)
      .attr("r", 5)
      .attr("fill", d => d.stage == "FINAL ROUND"? "maroon" : "cornflowerblue")
      .transition().duration(4000)
        .attr("cy", d => yScale(yAccessor(d)))

  // draw peripherals
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
      .tickFormat(d3.format("d"))
  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .attr("id", "x-axis")
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
  const yAxis = bounds.append("g")
    .call(yAxisGenerator)
      .attr("id", "y-axis")

  const yAxisLabel = yAxis.append("text")
    .attr("x", -dimensions.boundedWidth / 4)
    .attr("y", -dimensions.margin.left + 10)
    .attr("class", "y-axis-label")
    .text("Attendance")

  const xAxisLabel = xAxis.append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("class", "x-axis-label")
    .text("Year")

  const legend = bounds.append("g")
    .attr("id", "legend")

  legend.append("circle")
    .attr("cx", 760)
    .attr("cy", 14)
    .attr("r", 7)
    .attr("class", "legend-dot")

  legend.append("text")
    .attr("x", 630)
    .attr("y", 21)
    .text("FINAL ROUND")
    .attr("fill", "black")

  // set up interactions
  const tooltip = d3.select("#tooltip")
    .attr("class", "tooltip")

  function onMouseEnter() {
    d = d3.select(this).datum()
    tooltip.select("#teams")
      .text(`${d.team1} vs ${d.team2} (${d.goals})`)
    tooltip.select("#attendance")
      .text(`Attendance: ${yAccessor(d).toLocaleString()}`)
    tooltip.select("#year")
      .text(`Year: ${d.year}`)
    tooltip.select("#stage")
      .text(`${d.stage}`)
    tooltip.select("#home_team")
      .text(`Home: ${homeTeam(d)}`)
    tooltip.style("opacity", 0.9)
  }

  function onMouseMove() {
    tooltip.style("left", `${event.pageX + 20}px`)
    tooltip.style("top", `${event.pageY}px`)
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)
  }

  function homeTeam(d) {
    if(d.team1 == d.home) {
      return d.team1
    } else if(d.team2 == d.home){
      return d.team2
    } else {
      return "Other"
    }
  }
}

drawChart()
