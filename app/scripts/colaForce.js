var width = 960,
  height = 500,
  imageScale = 0.25;

var color = d3.scale.category20();

var cola = cola.d3adaptor()
  .linkDistance(60)
  .size([width, height]);

var outer = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("pointer-events", "all");

outer.append('rect')
  .attr('class', 'background')
  .attr('width', "100%")
  .attr('height', "100%")
  .attr('background','#fff')
  .call(d3.behavior.zoom().on("zoom", redraw));

var vis = outer
  .append('g');

var nodeMouseDown = false;

function redraw() {
  if (nodeMouseDown) return;
  vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

var edgesLayer = vis.append("g");
var nodesLayer = vis.append("g");

var modelgraph, viewgraph = { nodes: [], links: [] };

d3.json("data/fixedPoint.json", function (error, g) {
  modelgraph = g;
  var startNode = getNode("79");
  addViewNode(startNode);
  refocus(startNode);
  update();
});

function refocus(focus) {
  console.log('focus ', focus);
  modelgraph.links.forEach(function (l) {
    var u = modelgraph.nodes[l.source], v = modelgraph.nodes[l.target];
    if (u === focus && !inView(v)) addViewNode(v, focus);
    if (v === focus && !inView(u)) addViewNode(u, focus);
  });
  viewgraph.links = [];
  viewgraph.nodes.forEach(function (v) {v.colour = "blue"});
  modelgraph.links.forEach(function (l) {
    var u = modelgraph.nodes[l.source], v = modelgraph.nodes[l.target];

    console.log(' add' , l.target);
    if (inView(u) && inView(v)) viewgraph.links.push({ source: u, target: v });
    if (inView(u) && !inView(v)) u.colour = "red";
    if (!inView(u) && inView(v)) v.colour = "red";
  });
}

function inView(v) { return typeof v.viewgraphid !== 'undefined'; }

function addViewNode(v, startpos) {
  v.viewgraphid = viewgraph.nodes.length;
  if (typeof startpos !== 'undefined') {
    v.x = startpos.x;
    v.y = startpos.y;
  }
  viewgraph.nodes.push(v);
}

function getNode(name) {
  var v, i = modelgraph.nodes.length;
  while (i--) if ((v = modelgraph.nodes[i]).name == name) return v;
  return null;
}

function click(node) {
  if (node.colour == "blue") return;
  var focus = getNode(node.name);
  refocus(focus);
  update();
}

//function toggleImageZoom(img) {
//  var scale = 1;
//  d3.select(img).each(function (d) {
//    if (Math.abs(img.width.baseVal.value - d.width) < 1) scale /= imageScale;
//  });
//  imageZoom(img, scale);
//}

//function imageZoom(img, scale) {
//  d3.select(img)
//    .transition()
//    .attr("width", function (d) {
//      return scale * d.width;
//    })
//    .attr("height", function (d) { return scale * d.height; });
//}

function update() {
  cola.nodes(viewgraph.nodes)
    .links(viewgraph.links)
    .start();

  var link = edgesLayer.selectAll(".link")
    .data(viewgraph.links);

  link.enter().append("line")
    .attr("class", "link")
    .style("stroke-width", 2);

  link.exit().remove();

  var node = nodesLayer.selectAll(".node")
    .data(viewgraph.nodes, function (d) { return d.viewgraphid; });

  var enter = node.enter().append("g")
    //.attr("class", function (d) { return "node" + ('image' in d ? ' imagenode' : '') })
    .attr("class", function (d) { return "node" })
    .on("mousedown", function () { nodeMouseDown = true; })
    .on("mouseup", function () { nodeMouseDown = false; })
    .on("touchmove", function () {
      d3.event.preventDefault()
    })
    .call(cola.drag);

  //nodesLayer.selectAll(".imagenode")
  //  .attr("class", "node")
  //  .append("image")
  //  .attr("xlink:href", function (d) {
  //    var url = "graphdata/" + d['image'] + ".gif";
  //    var simg = this;
  //    var img = new Image();
  //    img.onload = function () {
  //      d.width = this.width * imageScale;
  //      d.height = this.height * imageScale;
  //      simg.setAttribute("width", d.width);
  //      simg.setAttribute("height", d.height);
  //    }
  //    return img.src = url;
  //  })
  //  .on("mouseover", function () { imageZoom(this, 1/imageScale) })
  //  .on("touchend", function () { toggleImageZoom(this) })
  //  .on("mouseout", function () { imageZoom(this, 1) });

  enter.append("circle")
    .attr("r", 7)
    .on("click", function (d) { click(d) })
    .on("touchend", function (d) { click(d) });

  node.style("fill", function (d) { return d.colour; })
    .append("title")
    .text(function (d) { return d.label; });

  cola.on("tick", function () {
    link.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}
