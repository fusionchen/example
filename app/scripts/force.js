var w = 960,
  h = 700,
  node,
  link,
  i = 0,
  expandChild = false,
  distend = 100,
  root;


var force = d3.layout.force()
  .linkDistance(function(d) {
    if(expandChild){
      console.log(' targat children ', d.target.children);
      return d.target.children ? distend : 80;
    }else{
      return  80;
    }
  })
  .size([w, h]);

var vis = d3.select("body").append("svg:svg")
  .attr("width", w)
  .attr("height", h);


d3.json("data/data.json", function(json) {
  root = json;
  root.fixed = true;
  root.x = w / 2;
  root.y = h / 2;
  update();
});

function update() {
  var nodes = flatten(root);
  nodes = nodes.sort(function (a, b) {
    return a.id - b.id;
  });

  var links = d3.layout.tree().links(nodes);

  console.log(nodes);

  // Restart the force layout.
  force.nodes(nodes)
    .links(links)
    .start();



  var link = vis.selectAll(".link")
    .data(links, function(d) { return d.target.id; });

  link.enter().append("line")
    .attr("class", "link");

  link.exit().remove();

  var node = vis.selectAll("g.node")
    .data(nodes)


  var groups = node.enter().append("g")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.children ? 10 : 5; })
    .attr("id", function (d) {
      return d.id
    })
    .on('click', click)
    .call(force.drag);


  groups.append("image")
    .attr("xlink:href", "https://github.com/favicon.ico")
    .attr("x", -8)
    .attr("y", -8)
    .attr("width", 16)
    .attr("height", 16);


  groups.append("text")
    .attr("dx", 12)
    .attr("dy", "0.35em")
    .style("font-size", "10px")
    .text(function (d) {
      console.log(d);
      return d.name
    });


  node.exit().remove();


  force.on("tick", function () {



    link.attr("x1", function (d) {
      return d.source.x;
    })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
    //link.attr("transform", function (d) {
    //  var dx = d.source.x - d.target.x, dy = d.source.y - d.target.y;
    //  var r = 180 * Math.atan2(dy, dx) / Math.PI;
    //  return "translate(" + d.target.x + "," + d.target.y + ") rotate(" + r + ") ";
    //}).attr("width", function (d) {
    //  var dx = d.source.x - d.target.x, dy = d.source.y - d.target.y;
    //  return Math.sqrt(dx * dx + dy * dy);
    //});
    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
}


// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
  (flatten(root))
    .forEach(function(d){d.fixed = false;});
  console.log('before ' ,d);
  d.fixed=true;
  d.px = d.x = w/2+100;
  d.py = d.y = w/2+100;
  console.log('after' ,d);
  force.resume();

  if (d.children) {
    d._children = d.children;
    d.children = null;

  } else if (d._children) {
    d.children = d._children;
    d._children = null;
    expandChild = true;
    distend = 350;

  } else {
    //d3.json("data/children.json", function(json) {
    //  d.children = json.children;
    //  expandChild = true;
    //  distend = 350;
    //  root.fixed = false;
    //
    //});

     }
  update();
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
  return nodes;
}
