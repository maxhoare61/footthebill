// Select elements
var scrolly = d3.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// Initialize Scrollama
var scroller = scrollama();

// Resize handler
function handleResize() {
  var stepHeight = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepHeight + "px");

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure.style("height", figureHeight + "px").style("top", figureMarginTop + "px");

  scroller.resize();
}

// Step enter event handler
function handleStepEnter(response) {
    
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

  const numberElement = figure.select("p");

  if (parseInt(numberElement.text(), 10) === response.index + 1) {
    return;
  }

  // Fade out
  numberElement.text(response.index + 1);
}

// Initialize everything
function init() {
  handleResize();

  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.33,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener("resize", handleResize);
}

// Kick off the initialization
init();
