const centralNode = document.querySelector('.node.central circle');
const lines = {
  story: document.getElementById('line-story'),
  about: document.getElementById('line-about'),
  project: document.getElementById('line-project'),
};
const nodes = {
  story: document.getElementById('story-node'),
  about: document.getElementById('about-node'),
  project: document.getElementById('project-node'),
};

// Helper function to calculate the center of a node
function getNodeCenter(node) {
  const image = node.querySelector('image');
  const x = parseFloat(image.getAttribute('x'));
  const y = parseFloat(image.getAttribute('y'));
  const width = parseFloat(image.getAttribute('width'));
  const height = parseFloat(image.getAttribute('height'));

  return {
    cx: x + width / 2,
    cy: y + height / 2,
  };
}

// Helper function to calculate the center of the central node
function getCentralNodeCenter() {
  const cx = parseFloat(centralNode.getAttribute('cx'));
  const cy = parseFloat(centralNode.getAttribute('cy'));
  return { cx, cy };
}

// Update line positions
function updateLines() {
  const central = getCentralNodeCenter();

  Object.entries(lines).forEach(([key, line]) => {
    const nodeCenter = getNodeCenter(nodes[key]);

    line.setAttribute('x1', central.cx);
    line.setAttribute('y1', central.cy);
    line.setAttribute('x2', nodeCenter.cx);
    line.setAttribute('y2', nodeCenter.cy);
  });

  // Keep updating positions
  requestAnimationFrame(updateLines);
}

// Start updating line positions
updateLines();