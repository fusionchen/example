var width = 960,
  height = 500,
  imageScale = 0.1,
  w = 1280,
  h = 800,
  root;

var red = "rgb(254, 137, 137)";

var d3cola = cola.d3adaptor()
  .linkDistance(60)
  .size([width, height]);

var outer = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("pointer-events", "all");

var zoom = d3.behavior.zoom();
outer.append('rect')
  .attr('class', 'background')
  .attr('width', "100%")
  .attr('height', "100%")
  .call(zoom.on("zoom", redraw));
  //.on("dblclick.zoom", zoomToFit);

var defs = outer.append("svg:defs");

function addGradient(id, colour1, opacity1, colour2, opacity2) {
  var gradient = defs.append("svg:linearGradient")
    .attr("id", id)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  gradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", colour1)
    .attr("stop-opacity", opacity1);

  gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", colour2)
    .attr("stop-opacity", opacity2);
}

addGradient("SpikeGradient", "red", 1, "red", 0);
addGradient("EdgeGradient", red, 1, "darkgray", 1);
addGradient("ReverseEdgeGradient", "darkgray", 1, red, 1);

var vis = outer.append('g');
var edgesLayer = vis.append("g");
var nodesLayer = vis.append("g");

var nodeMouseDown = false;

function redraw(transition) {
  // if mouse down then we are dragging not panning
  if (nodeMouseDown) return;
  (transition ? vis.transition() : vis)
    .attr("transform", "translate(" + zoom.translate() + ") scale(" + zoom.scale() + ")");
}

//var modelgraph = new tmdb.Graph();
var viewgraph = { nodes: [], links: [] };

var nodeWidth = 30, nodeHeight = 35;

// get first node
//var d = modelgraph.getNode(tmdb.Movie, 550, addViewNode);
//$.when(d).then(function (startNode) {
//  addViewNode(startNode);
//  refocus(startNode);
//});
d3.json("data/data.json", function(json) {
  root = json;
  console.log(' root ', root);
  root.x = w / 2;
  root.y = h / 2 - 80;
  var svg = d3.select("#viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    viewgraph.link = svg.selectAll(".link"),
    viewgraph.nodes = svg.selectAll(".node");

});
//function refocus(focus) {
//  var neighboursExpanded = modelgraph.expandNeighbours(focus, function (v) {
//    if (!inView(v)) addViewNode(v, focus);
//  });
//  refreshViewGraph();
//  $.when(neighboursExpanded).then(function f() {
//    refreshViewGraph();
//  });
//}
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
//
//function refreshViewGraph() {
// // viewgraph.links = [];
//  //viewgraph.nodes.forEach(function (v) {
//  //  var fullyExpanded = modelgraph.fullyExpanded(v);
//  //  v.colour = fullyExpanded ? "darkgrey" : red
//  //  if (!v.cast) return;
//  //});
//  var svg = d3.select("#viz")
//    .append("svg")
//    .attr("width", width)
//    .attr("height", height);
//
//  viewgraph.nodes = flatten(root);
//  viewgraph.links = d3.layout.tree().links(viewgraph.nodes);
// // Object.keys(modelgraph.edges).forEach(function (e) {
//  //  var l = modelgraph.edges[e];
//  //  var u = modelgraph.nodes[l.source], v = modelgraph.nodes[l.target];
//  //  if (inView(u) && inView(v)) viewgraph.links.push({ source: u, target: v });
//  //  if (inView(u) && !inView(v)) u.colour = red;
//  //  if (!inView(u) && inView(v)) v.colour = red;
//  //});
//  update();
//}
//
//function hintNeighbours(v) {
//  if (!v.cast) return;
//  var hiddenEdges = v.cast.length + 1 - v.degree;
//  var r = 2 * Math.PI / hiddenEdges;
//  for (var i = 0; i < hiddenEdges; ++i) {
//    var w = nodeWidth - 6,
//      h = nodeHeight - 6,
//      x = w / 2 + 25 * Math.cos(r * i),
//      y = h / 2 + 30 * Math.sin(r * i),
//      rect = new cola.vpsc.Rectangle(0, w, 0, h),
//      vi = rect.rayIntersection(x, y);
//    var dview = d3.select("#"+v.name()+"_spikes");
//
//    dview.append("rect")
//      .attr("class", "spike")
//      .attr("rx", 1).attr("ry", 1)
//      .attr("x", 0).attr("y", 0)
//      .attr("width", 10).attr("height", 2)
//      .attr("transform", "translate("+vi.x+","+vi.y+") rotate("+(360*i/hiddenEdges)+")")
//      .on("click", function () { click(v) });
//  }
//}
//
//function unhintNeighbours(v) {
//  var dview = d3.select("#" + v.name() + "_spikes");
//  dview.selectAll(".spike").remove();
//}
//
//function inView(v) { return typeof v.viewgraphid !== 'undefined'; }
//
//function addViewNode(v, startpos) {
//  v.viewgraphid = viewgraph.nodes.length;
//  var d = v.getImage();
//  $.when(d).then(function (node) {
//    d3.select("#" + node.name()).append("image")
//      .attr("transform", "translate(2,2)")
//      .attr("xlink:href", function (v) {
//        var url = v.imgurl;
//        var simg = this;
//        var img = new Image();
//        img.onload = function () {
//          simg.setAttribute("width", nodeWidth - 4);
//          simg.setAttribute("height", nodeHeight - 4);
//        }
//        return img.src = url;
//      }).on("click", function() { click(node) })
//  });
//  if (typeof startpos !== 'undefined') {
//    v.x = startpos.x;
//    v.y = startpos.y;
//  }
//  viewgraph.nodes.push(v);
//}
//
//function click(node) {
//  if (node.colour !== red) return;
//  var focus = modelgraph.getNode(node.type, node.id);
//  refocus(focus);
//}
//
function update() {
  var nodes = flatten(viewgraph.nodes);
  var links = d3.layout.tree().links(nodes);

  d3cola.nodes(nodes)
    .links(links)
    .start();

  var link = edgesLayer.selectAll(".link")
    .data(viewgraph.links);

  link.enter().append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("height", 2)
    .attr("class", "link");

  link.exit().remove();

  link
    .attr("fill", function (d) {
      if (d.source.colour === red && d.target.colour === red) return red;
      if (d.source.colour !== red && d.target.colour !== red) return "darkgray";
      return d.source.colour === red ? "url(#ReverseEdgeGradient)" : "url(#EdgeGradient)";
    });

  var node = nodesLayer.selectAll(".node")
    .data(viewgraph.nodes, function (d) { //
    // return d.viewgraphid;
      return d.id || (d.id = ++i);
    })

  var nodeEnter = node.enter().append("g")
    .attr("id", function (d) { return d.name; })
    .attr("class", "node" )
    .on("mousedown", function () { nodeMouseDown = true; }) // recording the mousedown state allows us to differentiate dragging from panning
    .on("mouseup", function () { nodeMouseDown = false; })
    .on("touchmove", function () { d3.event.preventDefault() })
    .on("mouseenter", function (d) { hintNeighbours(d) }) // on mouse over nodes we show "spikes" indicating there are hidden neighbours
    .on("mouseleave", function (d) { unhintNeighbours(d) })
    .call(d3cola.drag);

  nodeEnter.append("g").attr("id", function (d) { return d.name() + "_spikes" })
    .attr("transform", "translate(3,3)");

  nodeEnter.append("rect")
    .attr("rx", 5).attr("ry", 5)
    .style("stroke-width","0")
    .attr("width", nodeWidth).attr("height", nodeHeight)
    .on("click", function (d) { click(d) })
    .on("touchend", function (d) { click(d) });
  nodeEnter.append("title")
    .text(function (d) { return d.label; });

  node.style("fill", function (d) { return d.colour; });

  d3cola.on("tick", function () {
    link.attr("transform", function (d) {
      var dx = d.source.x - d.target.x, dy = d.source.y - d.target.y;
      var r = 180 * Math.atan2(dy, dx) / Math.PI;
      return "translate(" + d.target.x + "," + d.target.y + ") rotate(" + r + ") ";
    }).attr("width", function (d) {
      var dx = d.source.x - d.target.x, dy = d.source.y - d.target.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    node.attr("transform", function (d) { return "translate(" + (d.x - nodeWidth/2) + "," + (d.y-nodeHeight/2) + ")"; });
  });
}
//function graphBounds() {
//  var x = Number.POSITIVE_INFINITY, X=Number.NEGATIVE_INFINITY, y=Number.POSITIVE_INFINITY, Y=Number.NEGATIVE_INFINITY;
//  nodesLayer.selectAll(".node").each(function (v) {
//    x = Math.min(x, v.x - nodeWidth / 2);
//    X = Math.max(X, v.x + nodeWidth / 2);
//    y = Math.min(y, v.y - nodeHeight / 2);
//    Y = Math.max(Y, v.y + nodeHeight / 2);
//  });
//  return { x: x, X: X, y: y, Y: Y };
//}
//function fullScreenCancel() {
//  outer.attr("width", width).attr("height", height);
//  zoomToFit();
//}
//function zoomToFit() {
//  var b = graphBounds();
//  var w = b.X - b.x, h = b.Y - b.y;
//  var cw = outer.attr("width"), ch = outer.attr("height");
//  var s = Math.min(cw / w, ch / h);
//  var tx = (-b.x * s + (cw / s - w) * s / 2), ty = (-b.y * s + (ch / s - h) * s / 2);
//  zoom.translate([tx, ty]).scale(s);
//  redraw(true);
//}
