import { seriesSvgAnnotation } from "./annotation-series.js";
import {
  webglColor,
  findAllSwitchIndices
} from "./util.js";

let data = [];
let data2 = [];
let quadtree;
let quadtree2;

// function that takes a datapoint and shapes the data for the annotation
const createAnnotationData = datapoint => ({
  note: {
    label: datapoint.annotation,
    bgPadding: 10,
  },
  x: datapoint.x,
  y: datapoint.y,
  dx: 20,
  dy: 20
});

let xTicks;

const createAnnotationOrgData = datapoint => ({
  note: {
    label: datapoint.chr + "\n(" + datapoint.x + "," + datapoint.y + ")\n" + datapoint.ix + "\n" + datapoint.annotation,
    bgPadding: 5,
  },
  x: datapoint.x,
  y: datapoint.y,
  dx: 20,
  dy: 20
});

// create a web worker that streams the chart data
const streamingLoaderWorker = new Worker("streaming-tsv-parser.js");
streamingLoaderWorker.onmessage = ({
  data: { items, totalBytes, thresholds, finished }
}) => {
  const rows = items
    .map(d => ({
      ...d,
      x: Number(d.x),
      y: Number(d.y),
    }))
  data = data.concat(rows);

  if (finished) {
    document.getElementById("loading").style.display = "none";
    xTicks = findAllSwitchIndices(data)
    // console.log(data)

    const colorScale = d3.scaleThreshold()
      // .domain(d3.extent(dataset))
      .domain(thresholds)
      .range(['rgb(0,0,139)', 
              'rgb(0,0,139)',
              'rgb(36,36,155)', 
              'rgb(72,72,171)', 
              'rgb(109,109,188)', 
              'rgb(145,145,204)', 
              'rgb(182,182,221)', 
              'rgb(218,218,237)', 
              'rgb(255,255,255)', 
              'rgb(238,218,218)', 
              'rgb(221,182,182)', 
              'rgb(203,145,144)', 
              'rgb(188,109,109)', 
              'rgb(171,72,72)', 
              'rgb(153,31,31)', 
              'rgb(139,0,0)',
              'rgb(139,0,0)'])
    // compute the fill color for each datapoint
    const colorFill = d => {
      return webglColor(colorScale(d.ix))
    }

    const fillColor = fc.webglFillColor().value(colorFill).data(data);
    pointSeries.decorate(program => {
      fillColor(program)
    });

    // wire up the fill color selector
    // iterateElements(".controls a", el => {
    //   el.addEventListener("click", () => {
    //     iterateElements(".controls a", el2 => el2.classList.remove("active"));
    //     el.classList.add("active");
    //     fillColor.value(el.id === "language" ? languageFill : yearFill);
    //     redraw();
    //   });
    // });

    // create a spatial index for rapidly finding the closest datapoint
    quadtree = d3
      .quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(data);
  }

  redraw();
};

const streamingLoaderWorker2 = new Worker("streaming-tsv-parser.js");
streamingLoaderWorker2.onmessage = ({
  data: { items, totalBytes, thresholds, finished }
}) => {
  const rows = items
    .map(d => ({
      ...d,
      x: Number(d.x),
      y: Number(d.y),
    }))
  data2 = data2.concat(rows);

  if (finished) {
    document.getElementById("loading2").style.display = "none";

    // make a very basic d3 color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(
      d3
        .set(data2.map(d => d.annotation))
    )
    
    // compute the fill color for each datapoint
    const colorFill = d => {
      return webglColor(colorScale(d.annotation))
    }

    const fillColor = fc.webglFillColor().value(colorFill).data(data2);
    pointSeries2.decorate(program => {
      fillColor(program)
    });

    quadtree2 = d3
      .quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(data2);
  }

  redraw2();
};

streamingLoaderWorker.postMessage("output_compressed.tsv");
streamingLoaderWorker2.postMessage("spot.tsv");

const xScale2 = d3.scaleLinear().domain([-300, 400]);
const yScale2 = d3.scaleLinear().domain([80, -10]);
const xScaleOriginal2 = xScale2.copy();
const yScaleOriginal2 = yScale2.copy();

// const xScale = d3.scaleLinear().domain([0, 12067]);
// const yScale = d3.scaleLinear().domain([0, 494/4]);
const xScale = d3.scaleLinear().domain([0, 12067/4]);
const yScale = d3.scaleLinear().domain([0, 494]);
const xScaleOriginal = xScale.copy();
const yScaleOriginal = yScale.copy();

const pointSeries = fc
  .seriesWebglPoint()
  .equals((a, b) => a === b)
  .size(5)
  .crossValue(d => d.x)
  .mainValue(d => d.y);

const pointSeries2 = fc
  .seriesWebglPoint()
  .equals((a, b) => a === b)
  .size(30)
  .crossValue(d => d.x)
  .mainValue(d => d.y);

const zoom = d3
  .zoom()
  .scaleExtent([0.8, 10])
  .on("zoom", () => {
    // update the scales based on current zoom
    xScale.domain(d3.event.transform.rescaleX(xScaleOriginal).domain());
    yScale.domain(d3.event.transform.rescaleY(yScaleOriginal).domain());
    redraw();
  });

const zoom2 = d3
  .zoom()
  .scaleExtent([0.8, 10])
  .on("zoom", () => {
    // update the scales based on current zoom
    xScale2.domain(d3.event.transform.rescaleX(xScaleOriginal2).domain());
    yScale2.domain(d3.event.transform.rescaleY(yScaleOriginal2).domain());
    redraw2();
  });

const annotations = [];
const annotationsOrg = [];

// const click = fc.pointer().on("click", ([coord]) => {
//   console.log(coord)
// });

const pointer = fc.pointer().on("point", ([coord]) => {
  annotations.pop();
  annotationsOrg.pop();

  if (!coord || !quadtree) {
    return;
  }

  // find the closes datapoint to the pointer
  const x = xScale.invert(coord.x);
  const y = yScale.invert(coord.y);
  const radius = Math.abs(xScale.invert(coord.x) - xScale.invert(coord.x - 20));
  const closestDatum = quadtree.find(x, y, radius);

  // find the annotation that is associated to that point


  // if the closest point is within 20 pixels, show the annotation
  if (closestDatum) {
    const isMatch = d => d.Barcode === closestDatum.barcode;
    const match = data2.find(isMatch);
    annotations[0] = createAnnotationData(match);
    annotationsOrg[0] = createAnnotationOrgData(closestDatum)
  }

  redraw();
  redraw2();
});

const annotationSeries = seriesSvgAnnotation()
  .notePadding(15)
  .type(d3.annotationCallout);

const annotationSeries2 = seriesSvgAnnotation()
  .notePadding(15)
  .type(d3.annotationCallout);

// xAxis.decorate(selection => {
//   selection.selectAll("text")
//     .attr("transform", "rotate(45)") // Optional: Rotate tick labels for better readability
//     .text(d => "HELP"); // Show only the specified tick values
// });

const chart = fc
  // .chartCartesian(xScale, yScale)
  .chartCartesian({
    xScale: xScale,
    yScale: yScale,
    // xAxis: xAxis,
  })
  // .xTickValues(xTicks)
  // .yTicks(1000)
  .webglPlotArea(
    // only render the point series on the WebGL layer
    fc
      .seriesWebglMulti()
      .series([pointSeries])
      .mapping(d => d.data)
  )
  .svgPlotArea(
    // only render the annotations series on the SVG layer
    fc
      .seriesSvgMulti()
      .series([annotationSeries2])
      .mapping(d => d.annotationsOrg)
  )
  .decorate(sel =>
    sel
      .enter()
      .select("d3fc-svg.plot-area")
      .on("measure.range", () => {
        xScaleOriginal.range([0, d3.event.detail.width]);
        yScaleOriginal.range([d3.event.detail.height, 0]);
      })
      .call(zoom)
      .call(pointer)
  )

  const chart2 = fc
  .chartCartesian(xScale2, yScale2)
  .webglPlotArea(
    // only render the point series on the WebGL layer
    fc
      .seriesWebglMulti()
      .series([pointSeries2])
      .mapping(d => d.data2)
  )
  .svgPlotArea(
    // only render the annotations series on the SVG layer
    fc
      .seriesSvgMulti()
      .series([annotationSeries])
      .mapping(d => d.annotations)
  )
  .decorate(sel =>
    sel
      .enter()
      .select("d3fc-svg.plot-area")
      .on("measure.range", () => {
        xScaleOriginal2.range([0, d3.event.detail.width]);
        yScaleOriginal2.range([d3.event.detail.height, 0]);
      }
      )
      .call(zoom2)
      .call(pointer)
  );

// render the chart with the required data
// Enqueues a redraw to occur on the next animation frame
const redraw = () => {
  d3.select("#chart").datum({ annotationsOrg, data }).call(chart);

  chart.xTickValues(xTicks)
  // chart.xTickValues([10, 200, 3000, 4000])
  
  // chart.decorate(sel => {
  //   sel.append("g")
  //   .attr("class", "grid axis")
  //   .call(d3.axisLeft(
  //     yScale
  //     .copy()
  //   ));
  // })

};

const redraw2 = () => {
  d3.select("#chart2").datum({ annotations, data2 }).call(chart2);
};
