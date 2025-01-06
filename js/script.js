var initialNodes = [
  { name: "Central", shape: "circle", color: "#000" },
  { name: "Projects", shape: "circle", color: "#26b790" },
  { name: "Stories", shape: "triangle", color: "#26b790" },
  { name: "About", shape: "square", color: "#ff8200" }
];

var initialLinks = [
  { source: "Projects", target: "Central" },
  { source: "Stories", target: "Central" },
  { source: "About", target: "Central" }
];

var allNodes = [
  { name: "Central", shape: "circle", color: "#000" },
  { name: "Projects", shape: "circle", color: "#26b790" },
  { name: "Stories", shape: "triangle", color: "#26b790" },
  { name: "About", shape: "square", color: "#ff8200" },

  { name: "Dirty Donations", shape: "circle", color: "#26b790" },
  { name: "Emissions in Perspective", shape: "triangle", color: "#26b790" },
  { name: "Carbon Con", shape: "circle", color: "#26b790" },
  { name: "Political Donations", shape: "triangle", color: "#4c95f6" },
  { name: "Data Transparency", shape: "square", color: "#ff8200" },
  { name: "What is Downstream?", shape: "square", color: "#ff8200" },
  { name: "Documentation", shape: "triangle", color: "#26b790" }
];

var allLinks = [
  { source: "Projects", target: "Central" },
  { source: "Stories", target: "Central" },
  { source: "About", target: "Central" },

  { source: "Dirty Donations", target: "Projects" },
  { source: "Emissions in Perspective", target: "Projects" },
  { source: "Carbon Con", target: "Stories" },
  { source: "Political Donations", target: "Stories" },
  { source: "Data Transparency", target: "Stories" },
  { source: "What is Downstream?", target: "About" },
  { source: "Documentation", target: "About" }
];

var graph = {
  nodes: initialNodes,
  links: initialLinks
};

// Adjust canvas resolution
function adjustCanvasResolution() {
  const pixelRatio = window.devicePixelRatio || 1;
  canvas
    .attr("width", width * pixelRatio)
    .attr("height", height * pixelRatio)
    .style("width", `${width}px`)
    .style("height", `${height}px`);
  ctx.scale(pixelRatio, pixelRatio); // Scale the drawing context
}

var canvas = d3.select("#network"),
  width = canvas.attr("width"),
  height = canvas.attr("height"),
  ctx = canvas.node().getContext("2d"),
  r = 15,
  simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2))
    .force("collide", d3.forceCollide(r + 5))
    .force("charge", d3.forceManyBody().strength(-1500))
    .force("link", d3.forceLink().id((d) => d.name))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("bounding-box", () => {
    // Constrain nodes within the container
    graph.nodes.forEach((node) => {
      node.x = Math.max(30, Math.min(width - 30, node.x));
      node.y = Math.max(30, Math.min(height - 30, node.y));
    });
  })
  .alphaDecay(0.07); 

    // Adjust resolution
adjustCanvasResolution();

var radius = 350; // Set the desired radius from the central node
var angleStep = (2 * Math.PI) / (graph.nodes.length - 1); // Calculate the angle step

// Set initial positions of nodes
graph.nodes.forEach((node, index) => {
  if (node.name === "Central") {
    node.x = width / 2;
    node.y = height / 2;
  } else {
    var angle = index * angleStep;
    node.x = (width / 2) + radius * Math.cos(angle);
    node.y = (height / 2) + radius * Math.sin(angle);
  }
});

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
  const offsetX = (dx / magnitude) * (r + 20); // Offset away from the node
  const offsetY = (dy / magnitude) * (r + 20);

  // Position the label
  const labelX = d.x + offsetX;
  const labelY = d.y + offsetY;

  // Set font size and style
  if (["Projects", "Stories", "About"].includes(d.name)) {
    ctx.font = "bold 14px Bai Jamjuree"; // Bold font for specific nodes
  } else {
    ctx.font = "14px Bai Jamjuree"; // Regular font for other nodes
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure the text width and height
  const text = d.name;
  const textWidth = ctx.measureText(text).width;
  const textHeight = 6; // Approximate height for 16px font

  // Draw background rectangle
  const padding = 4; // Smaller padding
  ctx.fillStyle = "#f5f5f5"; // Background color (same as canvas background)
  ctx.fillRect(labelX - textWidth / 2 - padding, labelY - textHeight / 2 - padding, textWidth + 4, textHeight + 4);

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

canvas.on("click", function () {
  const [x, y] = d3.mouse(this); // Get mouse position
  const clickedNode = simulation.find(x, y, r * 2); // Find the clicked node

  if (clickedNode && ["Projects", "Stories", "About"].includes(clickedNode.name)) {
    expandNode(clickedNode.name);
  }
});

// Create a function to find positions of the sub-nodes around their parent node at a set radius.
function positionSubNodes(parentNode, subNodes) {
  const radius = 100; // Set the desired radius from the parent node
  const angleStep = (2 * Math.PI) / subNodes.length; // Calculate the angle step

  subNodes.forEach((node, index) => {
    const angle = index * angleStep;
    node.x = parentNode.x + radius * Math.cos(angle);
    node.y = parentNode.y + radius * Math.sin(angle);
  });
}

function expandNode(nodeName) {
  // Find the parent node
  const parentNode = graph.nodes.find(node => node.name === nodeName);

  // Find sub-nodes and links for the clicked node
  const subNodes = allNodes.filter(node => {
    return allLinks.some(link => link.source === node.name && link.target === nodeName);
  });

  const subLinks = allLinks.filter(link => link.target === nodeName);

  // Position the sub-nodes around the parent node
  positionSubNodes(parentNode, subNodes);

  // Add sub-nodes and links to the graph
  graph.nodes.push(...subNodes);
  graph.links.push(...subLinks);

  // Restart the simulation with updated nodes and links
  simulation.nodes(graph.nodes);
  simulation.force("link").links(graph.links);
  simulation.alpha(1).restart();
}

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

// ------------------ BINARY ANIMATION CODE ------------------

const targetText = "downstream project"; // Final text to display
const animatedText = document.getElementById("animated-text");
const binaryChars = ["0", "1"];
let currentText = targetText.replace(/./g, () => binaryChars[Math.floor(Math.random() * 2)]); // Start with random binary

animatedText.innerHTML = formatText(currentText); // Set initial binary text

// Function to format text with different fonts
function formatText(text) {
  return text
    .split("")
    .map((char, i) => {
      if (char === " " || targetText[i] !== char) {
        return `<span style="font-family: 'Courier New', Courier, monospace;">${char}</span>`;
      } else {
        return `<span style="font-family: 'Bai Jamjuree', sans-serif;">${char}</span>`;
      }
    })
    .join("");
}

// Randomly replace characters during binary oscillation
function randomBinaryTransition() {
  currentText = currentText.split("").map((_, i) => {
    return targetText[i] === " " || Math.random() > 0.5
      ? targetText[i]
      : binaryChars[Math.floor(Math.random() * 2)];
  }).join("");

  animatedText.innerHTML = formatText(currentText); // Update text content with mixed fonts
}

// Gradually reveal the final text
function finalReveal() {
  let revealedText = currentText.split("");

  // Reveal characters in order
  targetText.split("").forEach((char, i) => {
    setTimeout(() => {
      revealedText[i] = char;
      animatedText.innerHTML = formatText(revealedText.join(""));
    }, i * 50); // Slight delay between reveals
  });
}

// Main animation function
function animateText() {
  const duration = 750; // Total animation duration in milliseconds
  const stepTime = 80; // Time per binary oscillation step
  let elapsed = 0;

  const interval = setInterval(() => {
    randomBinaryTransition();
    elapsed += stepTime;

    if (elapsed >= duration) {
      clearInterval(interval); // Stop binary oscillation
      finalReveal(); // Start the final reveal
    }
  }, stepTime);
}

// Trigger the animation on page load
window.onload = animateText;
