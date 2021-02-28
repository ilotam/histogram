const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;


// parse the style value
const styleVal = (message, styleId) => {
    if (typeof message.style[styleId].defaultValue === "object") {

      return message.style[styleId].value.color !== undefined
        ? message.style[styleId].value.color
        : message.style[styleId].defaultValue.color;
    }
    return message.style[styleId].value !== undefined
      ? message.style[styleId].value
      : message.style[styleId].defaultValue;
};



const drawViz = message => {
  
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    if (document.querySelector("svg")) {
        //console.log("hello");
        let oldSvg = document.querySelector("svg");
        oldSvg.parentNode.removeChild(oldSvg);
      }

  // append the svg object to the body of the page
  var svg = d3.select("body")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var tblList = message.tables.DEFAULT;

  var data = tblList.map(row => {
                  
                              
      return {
                         
        price: row["dimension"][0]   
                            
                         
      }  
  });

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d.price; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);
  console.log(bins)
    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2")


};


// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}