// Set the parameters of the SVG group and Chart area  
var svgWidth = 960;
var svgHeight = 500;

var margin = {top: 20, right: 40, 
    bottom: 80, left: 100};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Append SVG group and Chart area to the HTML page
var svg = d3.select("#scatter").append("svg")
  .attr("width", svgWidth).attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initialize the x and y axis
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// This function sets the x-scale based on the xAxis chosen by the user
function xScale(Data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]),d3.max(Data, d => d[chosenXAxis])])
    .range([0, width]);
    console.log(d3.min(Data, d => d[chosenXAxis]));
  return xLinearScale;
};

// This function sets the y-scale based on the xAxis chosen by the user
function yScale(Data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
  .domain([d3.min(Data, d => +d[chosenYAxis]), d3.max(Data, d => +d[chosenYAxis])])
  .range([height, 0]);
  return yLinearScale;
};

/* 
We now start reading the data and executing the functions
*/
d3.csv("./assets/data/data.csv").then(function(Data) { 

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  Data.forEach(function(Data) {
    Data.smokes = +Data.smokes;
    Data.age = +Data.age;
    Data.poverty = +Data.poverty;
    Data.obesity = +Data.obesity;
    Data.healthcare = +Data.healthcare;
    Data.income = +Data.income;
  });
  // Step 2: Create scale functions using function created above
  // ==============================
  var xLinearScale = xScale(Data, chosenXAxis);
  var yLinearScale = yScale(Data, chosenYAxis);

  // Step 3: Create axis functions
  // ==============================
  var xAxis = d3.axisBottom(xLinearScale);
  var yAxis = d3.axisLeft(yLinearScale);
  
  // Step 4: Append Axes to the chart
  // ==============================
  var xAxisDraw = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

  var yAxisDraw = chartGroup.append("g")
  .call(yAxis);

  // Step 5: Create the circular x-y points
  // ==============================
    var scatterpoints = chartGroup.selectAll("circle")
    .data(Data).enter().append("circle")
    // For each item i in ".data(Data)", return the scaled
    // value of Data[i]["chosen axis variable"]
    // The data has the value according the numbers on the 
    // axis line, but the Scale function converts that to 
    // the value according to the pixels on the screen.
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "10").attr("fill", "teal").attr("opacity", "0.3");  

    // Step 6: Create text
    // ==============================
    var textGroup = chartGroup.selectAll("text")
    .data(Data).enter().append("text")
    .attr("font-size", "10px")
    // Line 78 explains the logic
    .attr("x", d => xLinearScale(d[chosenXAxis])-8)
    .attr("y", d => yLinearScale(d[chosenYAxis])+3)
    .text(d => d["abbr"]);  

  // *********************************
  //Create group for  3 x- axis labels
  // *********************************

  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`)
  .attr("x", 0);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
    
  // ***********************************
  // Create group for  3 y - axis labels
  // ***********************************

  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")

  var obeseLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left + 20)
  .attr("x", 0 - (height / 2))
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  .text("Obese (%)");

  var smokesLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("value", "smokes") // value to grab for event listener
  .classed("active", true)
  .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left + 60)
  .attr("x", 0 - (height / 2))
  .attr("value", "healthcare") // value to grab for event listener
  .classed("inactive", true)
  .text("Lacks Healthcare (%)");

  // ****************************
  // When you click on a new x-axis
  // ****************************
  xLabelsGroup.selectAll("text").on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {
    // replaces chosenXAxis with value
    chosenXAxis = value;

    // Apply a scaling factor depending on the data and the desired
    // axis, and store it as a variable
    xLinearScale = xScale(Data, chosenXAxis);
    // Using D3, Generate an axis that lies on the bottom of the chart
    var newXaxis = d3.axisBottom(xLinearScale);
    // Replace the old axis, with the new axis over the course of 0.5 sec.
    xAxisDraw.transition().duration(500).call(newXaxis);
    // translate the scatterpoints to the new positions over 1.0sec
    scatterpoints.transition()
    .duration(1000)
    .attr("cx", d => xLinearScale(d[chosenXAxis]));
    // translate the text to the new positions over 1.0sec
    textGroup.transition().duration(1000)
    .attr("x", d => xLinearScale(d[chosenXAxis])-8);  

    //*********************** */
    // This activates the new title and deactivates the previous one.
    //*********************** */
  if (chosenXAxis === "age") {
    povertyLabel
      .classed("active", false)
      .classed("inactive", true);
    ageLabel
      .classed("active", true)
      .classed("inactive", false);
    incomeLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else if (chosenXAxis === "poverty") {
    povertyLabel
      .classed("active", true)
      .classed("inactive", false);
    ageLabel
      .classed("active", false)
      .classed("inactive", true);
    incomeLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else {
    povertyLabel
      .classed("active", false)
      .classed("inactive", true);
    ageLabel
      .classed("active", false)
      .classed("inactive", true);
    incomeLabel
      .classed("active", true)
      .classed("inactive", false);
  }
  console.log(chosenXAxis);
}
});

  // ****************************
  // When you click on a new y-axis
  // ****************************
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
      // replaces chosenYAxis with value
      chosenYAxis = value;
      // Apply a scaling factor depending on the data and the desired
      // axis, and store it as a variable
      yLinearScale = yScale(Data, chosenYAxis); 
      // Using D3, Generate an axis that lies on the bottom of the chart
      var newYaxis = d3.axisLeft(yLinearScale);
      // Replace the old axis with the new axis over the course of 0.5 sec.
      yAxisDraw.transition().duration(500).call(newYaxis);
    // translate the scatterpoints to the new positions over 1.0sec
      scatterpoints.transition()
      .duration(1000)
      .attr("cy", d => yLinearScale(d[chosenYAxis]));
    // translate the text to the new positions over 1.0sec
      textGroup.transition().duration(1000)
      .attr("y", d => yLinearScale(d[chosenYAxis])+3);  

  //*********************** */
  // This activates the new title and deactivates the previous one.
  //*********************** */
  if (chosenYAxis === "smokes") {
    obeseLabel
      .classed("active", false)
      .classed("inactive", true);
    smokesLabel
      .classed("active", true)
      .classed("inactive", false);
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else if (chosenYAxis === "obesity") {
    obeseLabel
      .classed("active", true)
      .classed("inactive", false);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else {
    obeseLabel
      .classed("active", false)
      .classed("inactive", true);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    healthcareLabel
      .classed("active", true)
      .classed("inactive", false);
  }
  console.log(chosenYAxis);
  }
});

}).catch(function(error) {
  console.log(error);
});




