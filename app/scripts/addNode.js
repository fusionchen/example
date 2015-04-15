var w = 600,
  h = 500,
  node,
  link,
  temp,
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
  root.fixed = true;
  root.x = w / 2;
  root.y = h / 2;
  update();
});
function update() {
  var currentNodes = force.nodes();
  console.log(' add root', root);
  var nodes = flatten(root);
  var actualNodes = [];
  //nodes.reverse();
  //nodes = nodes.sort(function (a, b) {
  //  return a.index - b.index;
  //});
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
  console.log(' find the actualNodes ',actualNodes);
  nodes = actualNodes;


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
    .data(nodes);


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
    .attr("text-anchor", "left")
    .style("font-size", "10px")
    .style("fill", "#9ecae1")
    .text(function (d) {
      console.log("getting text" , d);
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
   // d.children = [];
    root.children.forEach(function(i){
         if(i.id === d.id){
            temp = i;
         }
    });
    temp.children =[];
    console.log(' root value ', temp );
    d3.json("data/children.json", function (json) {
      console.log('adding json', json);
         temp.children.push(json);
      console.log('children', d.children);
         update();

    });
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [],
    i = 0;
   console.log('in coming root', root);
  function recurse(node) {
    console.log(' node children', node.children);
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}
