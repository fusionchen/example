var w = 600,
  h = 500,
  node,
  i =0,
  link,
  root;

var force = d3.layout.force()
  .charge(-200)
//            .friction(-.2)
//            .gravity(0.4)
  .size([w, h]);

var vis = d3.select("body").append("svg:svg")
  .attr("width", w)
  .attr("height", h);


d3.json("data/teach.json", function(json) {
  root = json;
  root.x = w / 2;
  root.y = h / 2;
  update();
});


function update() {
  var nodes = flatten(root),
    nodes = nodes.sort(function (a, b) {
      return a.id - b.id;
    });

  var links = d3.layout.tree().links(nodes);

  console.log(nodes);

  // Restart the force layout.
  force.nodes(nodes)
    .links(links)
    .linkDistance(55)
    .start();


  var link = vis.selectAll(".link")
    .data(links);

  link.enter().append("line")
    .attr("class", "link");

  link.exit().remove();

  var node = vis.selectAll("g.node")
    .data(nodes)


  var groups = node.enter().append("g")
    .attr("class", "node")
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
  console.log(d);
  if (d.children) {
    d._children = d.children;
    d.children = null;
    update();
  } else if (d._children) {
    d.children = d._children;
    d._children = null;
    update();
  } else {
    d3.json("data/children.json", function (json) {

     d.children = json.children;
      update();

    });

    //update();
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [];

  function recurse(node) {
    if(!node.id) node.id = ++i;
    nodes.push(node);
    if (node.children) {
      for(var counter=0; counter<node.children.length; counter++){
        recurse(node.children[counter]);
      }
    }
  }

  recurse(root);
  return nodes;
}
