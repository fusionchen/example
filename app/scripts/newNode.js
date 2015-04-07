var root = {
  "name": "0",
  "children": [

    {"name": "1", "size": 1, children: [
      {"name": "a", size: 1},
      {"name": "a", size: 1},
      {"name": "a", size: 1},
      {"name": "a", size: 1}
    ]
    },
    {"name": "2", "size": 1, children: [
      {"name": "b", size: 1},
      {"name": "b", size: 1},
      {"name": "b", size: 1},
      {"name": "b", size: 1}
    ]
    },
    {"name": "3", "size": 1, children: [
      {"name": "c", size: 1},
      {"name": "c", size: 1},
      {"name": "c", size: 1},
      {"name": "c", size: 1}
    ]
    },
    {"name": "4", "size": 1, children: [
      {"name": "d", size: 1},
      {"name": "d", size: 1},
      {"name": "d", size: 1},
      {"name": "d", size: 1}
    ]
    },
    {"name": "5", "size": 1, children: [
      {"name": "e", size: 1},
      {"name": "e", size: 1},
      {"name": "e", size: 1},
      {"name": "e", size: 1}
    ]
    },
    {"name": "6", "size": 1, children: [
      {"name": "f", size: 1},
      {"name": "f", size: 1},
      {"name": "f", size: 1},
      {"name": "f", size: 1}
    ]
    }
  ]
};


var diameter = 400,
  width = diameter,
  height = diameter;

var i = 0,
  duration = 0;

var tree = d3.layout.tree()
  .size([360, diameter / 2 - 80])
  .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
  .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scale.category20();

var nodeEnter,
  depthFactor = 85;

update(root);

function update(source) {
  var nodes = tree.nodes(source),
    links = tree.links(nodes);

  // Normalize for fixed-depth
  nodes.forEach(function (d) {
    d.y = d.depth * depthFactor;
  });

  var link = svg.selectAll(".link")
    .data(links);

  link.enter()
    .append("path")
    .attr("class", "link");

  // moves links to their new position
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // transition exiting nodes to the parent's new position
  link.exit()
    .transition()
    .duration(duration)
    .remove();

  // update the nodes
  var node = svg.selectAll(".node")
    .data(nodes, function (d) {
      return d.id || (d.id =++ i);
    });

  nodeEnter = node.enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .on("click", click)


  nodeEnter.append("circle")
    .attr("r", 6)
    .style("fill", function(d) { return color(d.name);})
    .on("mouseover",function () {return d3.select(this).style("fill","salmon").attr("r",10);})
    .on("mouseout",function (d) {return d3.select(this).style("fill",color(d.name)).attr("r",6);})

  nodeEnter.append("text")
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .attr("transform", function(d) { return d.x < 180 ? (d.depth == 0 ? "" : "translate(8)") : (d.depth == 0 ? "rotate(-95)translate(34)" : "rotate(180)translate(-8)"); })
    .text(function(d) { return d.name; });

  // moves nodes to their new position; very important
  node.transition()
    .duration(duration)
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

  node.select("text")
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .attr("transform", function(d) { return d.x < 180 ? (d.depth == 0 ? "" : "translate(8)") : (d.depth == 0 ? "rotate(-95)translate(34)" : "rotate(180)translate(-8)"); });

  // transition exiting nodes to the parent's new position.
  node.exit() // IMPORTANT: see note above when setting the node variable
    .transition()
    .duration(duration)
    .remove();
}

function click(d) {
  //depthFactor = (d.depth == 0 ? 85 : 65);
  update(d.depth == 0 ? root : d)
}
