/* global d3 */
// se inicia con el codigo de https://bl.ocks.org/mbostock/1005873  Mike Bostock’s Block 1005873 , modificado por Pablo Andres Boada para los porpositos que este ejercicio requiere
function dibujar(seccionbread,seccionicle,secciontrail,seccionlabel,archivo){
    
    console.log(seccionbread);
    console.log(seccionicle);

var id = "#";
var seccion_dibujar_icle = id.concat(seccionicle);
console.log(seccion_dibujar_icle);

var seccion_dibujar_bread = id.concat(seccionbread);
console.log(seccion_dibujar_bread);


        
var width = 900,
    height = 200;

var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([0, height]);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var vis = d3.select(seccion_dibujar_icle).append("svg")
    .attr("width", width)
    .attr("height", height)

var partition = d3.partition()
    .size([width, height])
    .padding(1)
    .round(true);
	
// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 200, h: 30, s: 3, t: 20
};

var rect = vis.selectAll("rect");
var fo = vis.selectAll("foreignObject");
var totalSize=0;
var ruta = "data/";
var extension = ".json";
var archivo_procesar = ruta.concat(archivo,extension);

d3.json(archivo_procesar, function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(d3.entries(root)[0], function(d) {
      return d3.entries(d.value)
    })
    .sum(function(d) { return d.value })
    .sort(function(a, b) { return b.value - a.value; });

  partition(root);
  
  //add breadcrumb
  initializeBreadcrumbTrail(seccion_dibujar_bread,secciontrail,seccionlabel);
  var percentage = 100;
	  var percentageString = percentage + "%";

	  d3.select("#percentage")
		  .text(percentageString);

	  d3.select("#explanation")
		  .style("visibility", "");

	  var sequenceArray = root.ancestors().reverse();
	  //sequenceArray.shift(); // remove root node from the array
	  updateBreadcrumbs(sequenceArray, percentageString,secciontrail,seccionlabel);
  
  rect = rect
      .data(root.descendants())
    .enter().append("rect")
      .attr("x", function(d) { return d.x0; })
      .attr("y", function(d) { return d.y0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return color((d.children ? d : d.parent).data.key); })
      .on("click", clicked);
      
      console.log(rect.data(root.descendants()));
        
	fo = fo
		.data(root.descendants())
		.enter().append("foreignObject")
      .attr("x", function(d) { return d.x0; })
      .attr("y", function(d) { return d.y0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
     .style("cursor", "pointer")
     .text(function(d) { return d.data.key})
     .style("font-size", "60%")
     .on("click", clicked);
	 
	 //get total size from rect
	totalSize = rect.node().__data__.value;
});

function clicked(d) {
        
        
	x.domain([d.x0, d.x1]);
	y.domain([d.y0, height]).range([d.depth ? 20 : 0, height]);

	rect.transition()
      .duration(750)
      .attr("x", function(d) { return x(d.x0); })
      .attr("y", function(d) { return y(d.y0); })
      .attr("width", function(d) { return x(d.x1) - x(d.x0); })
      .attr("height", function(d) { return y(d.y1) - y(d.y0); });
	  
	  fo.transition()
        .duration(750)
      .attr("x", function(d) { return x(d.x0); })
      .attr("y", function(d) { return y(d.y0); })
      .attr("width", function(d) { return x(d.x1-d.x0); })
      .attr("height", function(d) { return y(d.y1-d.y0); });
	  
	  // code to update the BreadcrumbTrail();
	var percentage = (100 * d.value / totalSize).toPrecision(3);
	  var percentageString = percentage + "%";
	  if (percentage < 0.1) {
		percentageString = "< 0.1%";
	  }

	  d3.select("#percentage")
		  .text(percentageString);

	  d3.select("#explanation")
		  .style("visibility", "");

	  var sequenceArray = d.ancestors().reverse();
	  //sequenceArray.shift(); // remove root node from the array
	  updateBreadcrumbs(sequenceArray, percentageString,secciontrail,seccionlabel);
}

function initializeBreadcrumbTrail(seccion_dibujar_bread,secciontrail,seccionlabel) {
  // Add the svg area.
  var trail = d3.select(seccion_dibujar_bread).append("svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", secciontrail);
  // Add the label at the end, for the percentage.
  trail.append("text")
    .attr("id", seccionlabel)
    .style("fill", "#000");
	
	  // Make the breadcrumb trail visible, if it's hidden.
          
  var id = "#";
    var seccion_dibujar_trail = id.concat(secciontrail);        
  d3.select(seccion_dibujar_trail)
      .style("visibility", "");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString,secciontrail,seccionlabel) {
    var id = "#";
    var seccion_dibujar_trail = id.concat(secciontrail);   
    var seccion_dibujar_label = id.concat(seccionlabel); 
  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select(seccion_dibujar_trail)
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.key + d.depth; });

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("g");

  entering.append("polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return color((d.children ? d : d.parent).data.key); });

  entering.append("text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.data.key; });
	 
  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Now move and update the percentage at the end.
  d3.select(seccion_dibujar_trail).select(seccion_dibujar_label)
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

}
}
