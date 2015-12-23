

//create a function to print out the output of dimensions and sums
function print_filter(filter){
  var f=eval(filter);
  if (typeof(f.length) != "undefined") {}else{}
  if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
  if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
  console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 

// Create the dc.js chart objects & link to div
var dataTable = dc.dataTable("#dc-table-graph");
var magnitudeChart = dc.barChart("#dc-magnitude-chart");
var depthChart = dc.barChart("#dc-depth-chart");
var dayOfWeekChart = dc.rowChart("#dc-dayweek-chart");
var islandChart = dc.pieChart("#dc-island-chart");
var timeChart = dc.lineChart("#dc-time-chart");


d3.csv("./data/Crimes_01_2015_to_present.csv", function (data) {

var dtgFormat = d3.time.format("%m/%d/%Y %H:%M:%S %p");
// var dtgFormat2 = d3.time.format("%H");
// var dateFormat = d3.time.format('%m/%d/%Y');


data.forEach(function(d) {
  
  d.dtg = dtgFormat.parse(d.Date)
  // d.Date  = d.Date.substr(0,10) // month, day and year
  d.Hour  = d.Date.substr(11,5); //hour
  d.day = d3.time.day(d.dtg).getDay()
  d.lat   = +d.latitude;
  d.lng = +d.longitude;
  d.Ward = +d.Ward;

  });



var facts = crossfilter(data);

var all = facts.groupAll();


//time dimension

var timeDimension = facts.dimension(function(d){
  return d.dtg;
});

// time chart
var volumeByHour = facts.dimension(function(d) {
  return d3.time.hour(d.dtg);
});
var volumeByHourGroup = volumeByHour.group()
  .reduceCount(function(d) { return d.dtg; });


var dayOfWeek = facts.dimension(function (d) {
    var day = d.dtg.getDay();
    var name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return day + '.' + name[day];
});

var dayOfWeekGroup = dayOfWeek.group();


// Pie Chart
var Arrests = facts.dimension(function (d) {
  if (d.Arrest === true)
    return "True";
  else
    return "False";

  });


// for Arrests
var ArrestValue = facts.dimension(function (d) {
  return d.Arrest;       // add the Arrest dimension
});

var ArrestValueGroupCount = ArrestValue.group()
  .reduceCount(function(d) { return d.Arrest; }) // counts 



// for Ward
var WardValue = facts.dimension(function (d) {
  return d.Ward;
});
var WardValueGroup = WardValue.group();


var WardGroupCount = WardValue.group()
  .reduceCount(function(d) { return d.Ward; }) // counts 


  // count all the facts
dc.dataCount(".dc-data-count")
  .dimension(facts)
  .group(all);
    
  // Magnitide of Arrests: Bar Graph Counted
magnitudeChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 40, left: 40})
    .dimension(volumeByHour)
    .group(volumeByHourGroup)
  .transitionDuration(500)
    .centerBar(true)  
  .gap(65)  // 65 = norm
//    .filter([3, 5])
  .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.dtg; })))
  .elasticY(true)
  .xAxis().tickFormat();  

  // Ward Incident bar graph
  depthChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(WardValue)
    .group(WardValueGroup)
  .transitionDuration(500)
    .centerBar(true)  
  .gap(1)  
    .x(d3.scale.linear().domain([0, 51]))
  .elasticY(true)
  .xAxis().tickFormat(function(v) {return v;});

  // time graph
  timeChart.width(960)
    .height(150)
    .transitionDuration(500)
//    .mouseZoomable(true)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(volumeByHour)
    .group(volumeByHourGroup)
//    .brushOn(false)     // added for title
    .title(function(d){
      return dtgFormat(d.data.key)
      + "\nNumber of Events: " + d.data.value;
      })
  .elasticY(true)
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.dtg; })))
    .xAxis();

// row chart day of week
dayOfWeekChart.width(300)
  .height(220)
  .margins({top: 5, left: 10, right: 10, bottom: 20})
  .group(dayOfWeekGroup)
  .gap(10)
  .dimension(dayOfWeek)
  .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
  // .colors(d3.scale.category10())
  .label(function (d){
     return d.key.split('.')[1];
  })
  .title(function(d){return d.value;})
  .elasticX(true)
  .xAxis().ticks(4);

// islands pie chart
islandChart.width(250)
  .height(220)
  .radius(100)
  .innerRadius(30)
  .dimension(ArrestValue)
  .title(function(d){return d.value;})
  .group(ArrestValueGroupCount);

// Table of crime data
dataTable.width(960).height(800)
  .dimension(timeDimension)
.group(function(d) { return "Table"
 })
.size(10)
  .columns([
    function(d) { return d.dtg; },
    function(d) { return d.Latitude; },
    function(d) { return d.Longitude; },
    function(d) { return d.Arrest; },
    // function(d) { return d.Ward; },
  function(d) { return '<a href=\"http://maps.google.com/maps?z=12&t=m&q=loc:' + d.Latitude + '+' + d.Longitude+"\" target=\"_blank\">Google Map</a>"},
  function(d) { return '<a href=\"http://www.openstreetmap.org/?mlat=' + d.Latitude + '&mlon=' + d.Longitude +'&zoom=12'+ "\" target=\"_blank\"> OSM Map</a>"}
  ])
  .sortBy(function(d){ return d.dtg; })
  .order(d3.ascending);

  // Render the Charts
 dc.renderAll();
  
});