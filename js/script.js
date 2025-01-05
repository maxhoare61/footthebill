var graph = {
  nodes: [
    { name: "Central", shape: "circle", color: "#ff8200" },
    { name: "Projects", shape: "circle", color: "#26b790" },
    { name: "Stories", shape: "triangle", color: "#26b790" },
    { name: "About", shape: "square", color: "#ff8200" },

    { name: "Dirty Donations", shape: "circle", color: "#26b790" },
    { name: "Emissions in Perspective", shape: "circle", color: "#26b790" },
    { name: "Coming Soon", shape: "circle", color: "#26b790" },

    { name: "History of the Carbon Footprint", shape: "triangle", color: "#4c95f6" },
    { name: "Australia's Political Donations", shape: "triangle", color: "#4c95f6" },
    { name: "Public Data Transparency", shape: "triangle", color: "#4c95f6" },

    { name: "What is Downstream Project?", shape: "square", color: "#ff8200" },
    { name: "Documenting our Project", shape: "square", color: "#ff8200" }
  ],
  links: [
    { source: "Projects", target: "Central" },
    { source: "Stories", target: "Central" },
    { source: "About", target: "Central" },

    { source: "Dirty Donations", target: "Projects" },
    { source: "Emissions in Perspective", target: "Projects" },
    { source: "Coming Soon", target: "Projects" },

    { source: "History of the Carbon Footprint", target: "Stories" },
    { source: "Australia's Political Donations", target: "Stories" },
    { source: "Public Data Transparency", target: "Stories" },

    { source: "What is Downstream Project?", target: "About" },
    { source: "Documenting our Project", target: "About" }
  ],
};

var canvas = d3.select("#network"),
  width = canvas.attr("width"),
  height = canvas.attr("height"),
  ctx = canvas.node().getContext("2d"),
  r = 25,
  simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2))
    .force("collide", d3.forceCollide(r + 5))
    .force("charge", d3.forceManyBody().strength(-2000))
    .force("link", d3.forceLink().id(function (d) { return d.name; }));

// Initialize the simulation with graph data
simulation.nodes(graph.nodes);
simulation.force("link").links(graph.links);
simulation.on("tick", update);

// Add drag functionality
canvas
  .call(
    d3.drag()
      .container(canvas.node())
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );

let hoveredNode = null; // Track the currently hovered node
let openedNodes = new Set(); // Track nodes that have been opened

// Update function to render the graph
function update() {
  ctx.clearRect(0, 0, width, height);

  // Draw links
  ctx.beginPath();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#aaa";
  ctx.setLineDash([5, 5]); // Dashed lines
  graph.links.forEach(drawLink);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line style

  // Draw nodes
  ctx.globalAlpha = 1.0;
  graph.nodes.forEach(drawNode);
}

// Dragging helpers
function dragsubject() {
  return simulation.find(d3.event.x, d3.event.y);
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

// Draw nodes with hover functionality
function drawNode(d) {
  ctx.beginPath();

  // Set the fill color
  if (d.name === "Central") {
    ctx.fillStyle = "#000"; // Central node is always black
  } else if (d === hoveredNode) {
    ctx.fillStyle = d.color; // Hovered node's original color
  } else {
    ctx.fillStyle = "#fff"; // White by default
  }

  ctx.strokeStyle = "#000"; // Black outline
  ctx.lineWidth = 2;

  // Draw different shapes
  if (d.shape === "circle" || !d.shape) {
    ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  } else if (d.shape === "square") {
    ctx.rect(d.x - r, d.y - r, r * 2, r * 2);
  } else if (d.shape === "triangle") {
    ctx.moveTo(d.x, d.y - r);
    ctx.lineTo(d.x - r, d.y + r);
    ctx.lineTo(d.x + r, d.y + r);
    ctx.closePath();
  }

  ctx.fill();
  ctx.stroke();

  // Draw the label
  drawLabel(d);
}

// Function to draw labels
function drawLabel(d) {
  if (d.name === "Central") return; // Skip label for the central node

  // Find the central node's position
  const centralNode = graph.nodes.find((node) => node.name === "Central");

  // Calculate direction away from the central node
  const dx = d.x - centralNode.x;
  const dy = d.y - centralNode.y;

  // Normalize the direction vector to position the label
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const offsetX = (dx / magnitude) * (r + 15); // Offset away from the node
  const offsetY = (dy / magnitude) * (r + 15);

  // Position the label
  const labelX = d.x + offsetX;
  const labelY = d.y + offsetY;

  // Set font size and style
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure the text width and height
  const text = d.name;
  const textWidth = ctx.measureText(text).width;
  const textHeight = 16; // Approximate height for 16px font

  // Draw background rectangle
  ctx.fillStyle = "#f5f5f5"; // Background color (same as canvas background)
  ctx.fillRect(labelX - textWidth / 2 - 4, labelY - textHeight / 2 - 4, textWidth + 8, textHeight + 8);

  // Draw the label text
  ctx.fillStyle = "#000"; // Label color
  ctx.fillText(text, labelX, labelY);
}

// Draw links
function drawLink(l) {
  ctx.moveTo(l.source.x, l.source.y);
  ctx.lineTo(l.target.x, l.target.y);
}

canvas.on("mousemove", function () {
  const [x, y] = d3.mouse(this); // Get mouse position
  const node = simulation.find(x, y, r * 2); // Find node near the mouse

  if (node !== hoveredNode) {
    hoveredNode = node; // Update hovered node
    update(); // Redraw the graph
  }
});

canvas.on("mouseleave", function () {
  hoveredNode = null; // Clear hovered node when the mouse leaves
  update(); // Redraw the graph
});

// Remove click functionality to reveal sub-nodes
// canvas.on("click", function () {
//   const [x, y] = d3.mouse(this); // Get mouse position
//   const clickedNode = simulation.find(x, y, r * 2); // Find the clicked node

//   if (clickedNode && !openedNodes.has(clickedNode.name)) {
//     // Add sub-nodes and links dynamically
//     if (clickedNode.name === "Projects") {
//       graph.nodes.push(
//         { name: "Dirty Donations", shape: "circle", color: "#26b790" },
//         { name: "Emissions in Perspective", shape: "circle", color: "#26b790" },
//         { name: "Coming Soon", shape: "circle", color: "#26b790" }
//       );
//       graph.links.push(
//         { source: "Dirty Donations", target: "Projects" },
//         { source: "Emissions in Perspective", target: "Projects" },
//         { source: "Coming Soon", target: "Projects" }
//       );
//     } else if (clickedNode.name === "Stories") {
//       graph.nodes.push(
//         { name: "History of the Carbon Footprint", shape: "triangle", color: "#4c95f6" },
//         { name: "Australia's Political Donations", shape: "triangle", color: "#4c95f6" },
//         { name: "Public Data Transparency", shape: "triangle", color: "#4c95f6" }
//       );
//       graph.links.push(
//         { source: "History of the Carbon Footprint", target: "Stories" },
//         { source: "Australia's Political Donations", target: "Stories" },
//         { source: "Public Data Transparency", target: "Stories" }
//       );
//     }

//     // Mark the clicked node as opened
//     openedNodes.add(clickedNode.name);

//     // Restart the simulation with updated nodes and links
//     simulation.nodes(graph.nodes);
//     simulation.force("link").links(graph.links);
//     simulation.alpha(1).restart();
// });

// Initialize the simulation with graph data
simulation.nodes(graph.nodes);
simulation.force("link").links(graph.links);
simulation.on("tick", update);

// Add drag functionality
canvas
  .call(
    d3.drag()
      .container(canvas.node())
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );