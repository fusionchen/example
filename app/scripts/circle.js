var w = 1280,
  h = 800,
  node,
  link,
  duration = 100,
  expandChild = false,
  distend = 100,
  root;

var diagonal = d3.svg.diagonal()
  .projection(function (d) {
    return [d.y, d.x];
  });

var force = d3.layout.force()
  .linkDistance(function(d) {
    if(expandChild){
      return d.target.children ? distend : 80;
    }else{
      return  80;
    }
     })
  .size([w, h]);
force.linkStrength(0.1);
var vis = d3.select("body").append("svg")
  .attr("width", w)
  .attr("height", h);
 // .attr("transform", "translate(" + 10 + "," + 30 + ")");




d3.json("data/data.json", function(json) {
  root = json;
  root.fixed = true;
  root.x = w / 2;
  root.y = h / 2;
  update();
});

function update() {
  var currentNodes = force.nodes();
  var nodes = flatten(root);
  var actualNodes = [];

  var values = currentNodes.map(function(obj) { return obj.name});
  var newNodesValues = nodes.map(function(obj) { return obj.name });


  for(var i = 0; i < currentNodes.length; i++) {
    if(newNodesValues.indexOf(currentNodes[i].name) !== -1) {
      actualNodes.push(currentNodes[i]);
    }
  }

  for(var i = 0; i < nodes.length; i++) {
    if(values.indexOf(nodes[i].name) == -1) {
      actualNodes.push(nodes[i]);
    }
  }

  nodes = actualNodes;

  //var nodes = flatten(root),
   var links = d3.layout.tree().links(nodes);
  // Restart the force layout.
  force
    .nodes(nodes)
    .links(links)
    .start();

  // Update the links…
  link = vis.selectAll("line.link")
    .data(links, function(d) { return d.target.id; });

  // Enter any new links.
  link.enter().insert("svg:line", ".node")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  // Exit any old links.
  link.exit().transition()
    .duration(duration)
    .attr("d", function (d) {
      var o = {x: d.source.x, y: d.source.y};
      return diagonal({source: o, target: o});
    }).remove();

  // Update the nodes…
  node = vis.selectAll("circle.node")
    .data(nodes, function(d) { return d.id; })
    .style("fill",color);

  node.transition()
    .attr("r", function(d) { return d.children ? 10 : 4.5; });


  // Enter any new nodes.
  var nodeEnter = node.enter().append("circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.children ? 10 : 5; })
    .style("fill", color)
    .on("click", click)
    .call(force.drag);

  node.append("svg:text")
    .attr("dy", ".35em")
    .style("font-size", "10px")
    .attr("text-anchor", "middle")
    .text(function (d) {
      console.log('name ' + d.name);
      return d.name;
    });

  node.select("circle")
   .style("fill", color); //calls delegate
  // Exit any old nodes.
  node.exit().remove();
  // Stash the old positions for transition.
  nodes.forEach(function (d) {
    d.x1 = d.x;
    d.y1 = d.y;
  });
}


force.on("tick", function(d) {
  node[0].x = w / 2;
  node[0].y = h / 2;
  link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
});
// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "OrangeRed1" : d.children ? "#FFC1C1" : "#fff";

}

// Toggle children on click.
function click(d) {
  if (d3.event.defaultPrevented) return; // ignore drag
  console.log( ' click ', d);
  if (d.children) {
    d._children = d.children;
   // d._children.forEach();
    d.children = null;
    update();
  }else if (d._children) {
    d.children = d._children;
    d._children = null;
    update();
    expandChild = true;
    distend = 350;
    root.fixed = false;
  }else {
    console.log(' call children');
    //d3.json("data/data.json", function (json) {
    //  console.log(' call children',json.children);
    //  d.children = json.children;
    //  update();
    //})
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
   // return node.size;
  }

  recurse(root);
  return nodes;
}
