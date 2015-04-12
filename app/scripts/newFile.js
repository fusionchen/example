
var root = {
  name: "flare",
  children: [{
    name: "analytics",
    children: [{
      name: "cluster",
      children: [{
        name: "AgglomerativeCluster",
        size: 3938
      }, {
        name: "CommunityStructure",
        size: 3812
      }, {
        name: "HierarchicalCluster",
        size: 6714
      }, {
        name: "MergeEdge",
        size: 743
      }]
    }, {
      name: "graph",
      children: [{
        name: "BetweennessCentrality",
        size: 3534
      }, {
        name: "LinkDistance",
        size: 5731
      }, {
        name: "MaxFlowMinCut",
        size: 7840
      }, {
        name: "ShortestPaths",
        size: 5914
      }, {
        name: "SpanningTree",
        size: 3416
      }]
    }, {
      name: "optimization",
      children: [{
        name: "AspectRatioBanker",
        size: 7074
      }]
    }]
  }]
};

var w = 1280,
  h = 800,
  node,
  link,
  svg,
  force,
  text,
  diagonal,
  duration = 500;

init();
function init() {
  svg = d3.select("body")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

  force = d3.layout.force()
    .on("tick", tick)
    .linkDistance(function(d) { return d.target._children ? 180 : 100; })
    .size([w, h ]);

  diagonal= d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

  update();

}


//d3.json("data/graph.json", function(json) {
//  root = json;
//  root.fixed = true;
//  root.x = w / 2;
//  root.y = h / 2;
//  root.children.forEach(collapse);
//  update(root);
//});

function update() {
  root.fixed = true;
  root.x = w/2;
  root.y = h/2;
  var nodes = flatten(root),
    links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
    .nodes(nodes)
    .links(links)
    .start();

  // Update the links…
  link =  svg.selectAll("line.link")
    .data(links, function(d) { return d.target.name; });

  link.exit().remove;

  // Enter any new links.
  link.enter().insert("svg:line", ".node")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  link.transition()
    .duration(duration)
    .attr("d", diagonal);
  link.exit().remove();

  // Update the nodes…
  //node = vis.selectAll("circle.node")
  //  .data(nodes, function(d) { return d.id; })
  //  .style("fill", color);
  node = svg.selectAll("circle.node")
    .data(nodes, function(d) { return d.name; })
    .classed("collapsed", function(d) { return d._children ? 1 : 0; })
    .style("fill", color);

  node.transition()
    .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; });

  // Enter any new nodes.
  node.enter().append("svg:circle")
    .attr("class", "node")
    .attr("r", function (d) {return  d.children ? 4.5 : Math.sqrt(d.size) / 10; })
    .classed('directory', function(d) { return (d._children || d.children) ? 1 : 0; })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .style("fill", color)
    .on("click", click)
    .call(force.drag);

  //node.enter().append("text")
  ////  .attr("x", function(d) { return d.children || d._children ? 45 : 20; })
  //  .attr("dy", "1em")
  // // .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  //  //.attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name.length * 8.5)  + ")"; })
  //  .text(function(d) { return d.name; });
  node.exit().remove();

  text =svg.append("svg:text")
          .attr('class', 'nodetext')
          .attr('dy', 0)
          .attr('dx', 0)
        //  .text(function(d) { return d.name; })
          .attr('text-anchor', 'middle');

  //var nodeUpdate = g.node.transition()
  //  .duration(duration)
  //  .attr("transform", function (d) {
  //    return "translate(" + d.y + "," + d.x + ")";
  //  });
  //nodeUpdate.select("circle")
  //  .attr("r", 4.5)
  //  .style("fill", function (d) {
  //    return d._children ? "lightsteelblue" : "#fff";
  //  });
  //
  //nodeUpdate.select("text")
  //  .style("fill-opacity", 1);
  //


}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) {
    return "translate(" + Math.max(5, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
  });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
  //if (d.depth != 4) {
  //  if (d3.event.defaultPrevented) return; // ignore drag
  //  if (d.children) {
  //    d._children = d.children;
  //    d.children = null;
  //  } else {
  //    d.children = d._children;
  //    d._children = null;
  //  }
  //  update(d);
  //}
  //else
  //{
  //  //var circle = d3.select(this).selectAll("circle");
  //  //var togglestate;
  //  //console.log(circle.style("fill"));
  //  //if  (circle.style("fill") == "#b0c4de") {
  //  //  togglestate="on";
  //  //  circle.style("fill","red");
  //  //  toggleNode(togglestate,d);
  //  //}
  //  //else {
  //  //  togglestate="off";
  //  //  circle.style("fill","lightsteelblue");
  //  //  toggleNode(togglestate,d);
  //  //}
  //  console.log('call here');
  //}
  //console.log(' click d',d);
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update();
}

// Returns a list of all nodes under the root.
function flatten(data) {
  var nodes = [],
    i = 0;
  //count only children (not _children)
  //note that it doesn't count any descendents of collapsed _children
  //rather elegant?
  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }
  recurse(data);

  //Done:
  return nodes;
}
// Collapse nodes
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}
function color(d) {
  return d._children ? "#3182bd" // collapsed package
    :
    d.children ? "#c6dbef" // expanded package
      :
      "#fd8d3c"; // leaf node
}
