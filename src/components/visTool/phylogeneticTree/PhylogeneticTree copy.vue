<template>
  <div class="svgWrapper" ref="resizeRef">
    <svg ref="svgRef">
      <g ref="gRef" />
    </svg>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { computed, onMounted, reactive, ref, watch, inject } from "vue";
import * as $sp from "/@js/support.js";
import useResizeObserver from "/@js/resizeObserver";
import * as horizontal from "/@js/D3Behavior/layout/horizontal.js";
import { interpolatePath } from "d3-interpolate-path";
import { interpolateYlOrRd } from "d3-scale-chromatic";

const props = defineProps({
  config: {
    type: Object,
    default: {
      type: { type: String, defalut: "cluster" },
      layout: { type: String, default: "horizontal" },
      showLength: { type: Boolean, default: false },
      showTicklines: { type: Boolean, defalue: false },
      zoomable: { type: Boolean, default: true },
      resetZoom: { type: Boolean, default: true },
      resize: { type: Boolean, default: true },
      expand: { type: Object, defalut: { x: 0, y: 0 } },
      style: {
        type: Object,
        default: {
          fontsize: 10,
          leafsize: 5,
          leafstroke: 0.5,
        },
      },
      sortBy: { type: String, defalut: null },
      selected: { type: Object, default: [] },
      leafs:{type:Object,defalut:[]},
      maxDistance: { type: Number, defalue: 0 },
      isSync:{type:Boolean, defalut:false}
    },
  },
  data: { type: Object },
});

const global = inject("global");

const svgRef = ref(null);
const gRef = ref(null);
const { resizeRef, resizeState } = useResizeObserver();

const initPadding = () => {
  const {
    data,
    config: {
      style: { leafsize, fontsize },
    },
  } = props;
  const len = Math.max(...data.leafs().map((el) => el.id.length));
  const p = 20;
  return {
    t: p,
    r: (fontsize * len) / 2 + leafsize + p,
    b: p,
    l: p,
  };
};

const param = reactive({
  currentTransform: null,
  duration: 500,
  padding: initPadding(),
});

var internaldata = {};

// Transform translate when initially no zoom
const transformSvg = (ele) => {
  const { t, l } = param.padding;
  return ele.attr("transform", `translate(${t}, ${l})`);
};

const layout = computed({
  get() {
    const layouts = { horizontal };
    return layouts[props.config.layout];
  },
});

const tree = computed({
  get() {
    const { width, height } = size.value;
    const tree = props.config.type === "cluster" ? d3.cluster() : d3.tree();
    layout.value.size(tree, { width, height });
    return tree;
  },
});

const size = computed({
  get() {
    const { width, height } = resizeState.dimensions;
    const { t, r, b, l } = param.padding;
    const { x, y } = props.config.expand;
    return {
      width: width - l - r + x,
      height: height - t - b + y,
    };
  },
});

//#region [Coloring nodes]
const mapColor = (distance) => {
  const { maxDistance } = props.config;
  var t = maxDistance ? scale(distance * -1, maxDistance * -1) : 0.5;
  return interpolateYlOrRd(t);
};

const scale = (num, in_min, in_max = 0, out_min = 0, out_max = 1) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};
//#endregion

const showTicklines = () => {
  const { g, width, height } = internaldata;
  const { showTicklines } = props.config;
  if (showTicklines) {
    const yscale = d3
      .scaleLinear()
      .domain([0, width]) // unit: km
      .range([0, width]); // unit: pixels
    g.append("g")
      .attr("class", "tickLines")
      .selectAll("line")
      .data(yscale.ticks(12))
      .enter()
      .append("svg:line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("x1", yscale)
      .attr("x2", yscale);
  } else {
    g.selectAll(".tickLines").remove();
  }
};

const syncFromGlobal = ()=>{
  const {isSync} = props.config
  if(isSync){
    const{selected, sortBy} = global;
    props.config.selected = selected;
    props.config.sortBy = sortBy;
  }
}

//#region [Event on leafs]
const sortBy = (event, d) => {
  event.preventDefault();
  const id = d.data.id;
  props.config.sortBy = id;
};


//#region [Coloring Links]
const selectLeaf = (_, d) => {
  const id = d.data.id
  const { selected } = props.config
  props.config.selected = selected.includes(id) ? selected.filter(item => item !== id) : selected.concat([id])
}


const coloringLinks = () => {
  const { root,leaves } = internaldata;
  const { selected } = props.config;
  const leafs = root.leaves();
  const leafss = leaves.nodes(); // to be continue

  leafs.forEach(d => {    
    d3.select(d.linkExtensionNode)
      .classed("link-extension--active", false)
      .each(moveToFront);
    do
      d3.select(d.linkNode)
        .classed("link--active", false)
        .each(moveToFront);
    while ((d = d.parent));
  })

  leafs.forEach(d => {
    const id = d.data.id
    if (selected.includes(id)) {
      d3.select(d.linkExtensionNode)
        .classed("link-extension--active", true)
        .each(moveToFront);
      do
        d3.select(d.linkNode)
          .classed("link--active", true)
          .each(moveToFront);
      while ((d = d.parent));
    }
  })
}


function moveToFront() {
  this.parentNode.appendChild(this);
}
//#endregion
//#endregion


//#region [Tooltip]
const showTooltip = (event, d) => {
  let pointer = d3.pointer(event, d);
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipHtml(d);
  tooltip.style.display = "block";
  tooltip.style.left = pointer[0] + 15 + "px";
  tooltip.style.top = pointer[1] + "px";
};

const hideTooltip = () => {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
};

const tooltipHtml = (d) => {
  const { sortBy } = props.config;
  const { id, depth, sortDistance } = d.data;
  return `
    <span>taxon: <b>${id}</b></span>
    <br>
    <span>depth: <b>${depth}</b></span>
    <br>
    ${sortBy ?
      `<span>distance to <i>${sortBy}</i>: <b>${sortDistance}</b></span>`
      : ""
    }
  `;
};
//#endregion


//#region [Leafs]
const drawLeaves = () => {
  const { g, root, leaves } = internaldata;
  const { fontsize, leafsize, leafstroke } = props.config.style;

  if (!leaves) {
    internaldata.leaves = g
      .append("g")
      .attr("class", "leaves")
      .selectAll("circle")
      .data(root.leaves())
      .enter()
      .append("g")
      .on("click", selectLeaf)
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip)
      .on("contextmenu", sortBy);

    internaldata.leave_nodes = internaldata.leaves
      .append("circle")
      .attr("class", "leaf-node")
      .attr("stroke", "gray")
      .attr("stroke-width", `${leafstroke}px`);

    internaldata.leave_labels = internaldata.leaves
      .append("text")
      .attr("class", "labels")
      .text(function (d) {
        return d.data.id;
        // return d.data.id.replace(/_/g, " ");
      });
  }
  internaldata.leave_nodes
    .transition()
    .attr("r", leafsize)
    .attr("transform", function (d) {
      return `translate(${d.y} ,${d.x})`;
    })
    .attr("fill", function (d) {
      return mapColor(d.data.sortDistance);
    });
  // .text(function (d) {
  //   return d.data.id;
  //   // return d.data.id.replace(/_/g, " ");
  // });;

  internaldata.leave_labels
    .style("font-size", `${fontsize}px`)
    .attr("dy", `${fontsize / 3}px`)
    .transition()
    .attr("transform", function (d) {
      return `translate(${d.y + (leafsize + 2)} , ${d.x})`;
    });
};
//#endregion


//#region [Links]
const drawLinks = () => {
  const { g, root, links } = internaldata;
  const { showLength } = props.config;
  if (links) {
    links.transition().attrTween("d", function (d) {
      var previous = d3.select(this).attr("d");
      var current = showLength ? linkVariable(d) : linkConstant(d);
      return interpolatePath(previous, current);
    });
  } else {
    internaldata.links = g
      .append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", showLength ? linkVariable : linkConstant);
  }
};

const drawLinkExtensions = () => {
  const { g, root, linkExtensions } = internaldata;
  const { showLength } = props.config;
  if (linkExtensions) {
    linkExtensions.transition().attrTween("d", function (d) {
      var previous = d3.select(this).attr("d");
      var current = showLength
        ? linkExtensionVariable(d)
        : linkExtensionConstant(d);
      return interpolatePath(previous, current);
    });
  } else {
    internaldata.linkExtensions = g
      .append("g")
      .attr("class", "link-extensions")
      .selectAll("path")
      .data(
        root.links().filter(function (d) {
          return !d.target.children;
        })
      )
      .enter()
      .append("path")
      .each(function (d) {
        d.target.linkExtensionNode = this;
      })
      .attr("d", showLength ? linkExtensionVariable : linkExtensionConstant);
  }
};

const linkVariable = (d) =>
  _linkStep(d.source.x, d.source.y0, d.target.x, d.target.y0);

const linkConstant = (d) =>
  _linkStep(d.source.x, d.source.y, d.target.x, d.target.y);

const linkExtensionVariable = (d) =>
  _linkStep(d.target.x, d.target.y0, d.target.x, size.value.width);

const linkExtensionConstant = (d) =>
  _linkStep(d.target.x, d.target.y, d.target.x, size.value.width);

const _linkStep = (startX, startY, endX, endY) => {
  return (
    "M" +
    startY +
    "," +
    startX +
    (endX == startX ? "" : "L" + startY + "," + endX) +
    ("L" + endY + "," + endX)
  );
};
//#endregion

const maxLength = (d) => {
  return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
};

const setY0 = (d, y0, k) => {
  d.y0 = (y0 += d.data.length) * k;
  if (d.children)
    d.children.forEach(function (d) {
      setY0(d, y0, k);
    });
};

const onData = (data) => {
  if (!data) {
    internaldata.root = null;
    return;
  }
  props.config.leafs = [...data.leafs().map((el) => el.id)]
  var root = d3.hierarchy(data, function (d) {
    return d.children;
  });

  internaldata.root = root;
  redraw();
};

const sortTree = () => {
  const { root } = internaldata;
  const {
    data,
    config: { sortBy },
  } = props;

  if (sortBy) {
    var m = data.getDescendant(sortBy);
    data.getSortDistanceTo(m);
    root.sort(function (a, b) {
      return a.data.sortDistance - b.data.sortDistance;
    });
  }
  
  props.config.maxDistance = Math.max(
    ...data.leafs().map((el) => el.sortDistance)
  );
};

const redraw = () => {
  const { root } = internaldata;
  sortTree();
  setY0(root, (root.data.length = 0), size.value.width / maxLength(root));
  tree.value(root);

  drawLinks();
  drawLinkExtensions();
  drawLeaves();
  coloringLinks();
};

//#region [Zoom]
const setUpZoom = () => {
  const { svg } = internaldata;
  const zoom = d3.zoom();
  zoom.on("zoom", onZoom);
  svg.call(zoom);
  svg.call(zoom.transform, currentTransform());
  return zoom;
};

const onZoom = (e) => {
  const { g } = internaldata;
  g.attr("transform", e.transform);
  // console.log(e.transform.k)
};

const removeZoom = () => {
  const { zoom, svg } = internaldata;
  zoom.on("zoom", null);
  internaldata.zoom = null;
  svg.on(".zoom", null);
};

const resetZoom = () => {
  const { zoomable } = props.config;
  if (!zoomable) {
    return Promise.resolve(false);
  }
  const { svg, zoom } = internaldata;
  const transitionPromise = $sp.toPromise(
    svg
      .transition()
      .duration(param.duration)
      .call(zoom.transform, initTransform())
  );
  return transitionPromise.then(() => true);
};

const initTransform = () => {
  const { t, l } = param.padding;
  return d3.zoomIdentity.translate(t, l);
};

const currentTransform = () => {
  param.currentTransform = param.currentTransform
    ? d3.zoomTransform(internaldata.g.node())
    : initTransform();
  return param.currentTransform;
};
//#endregion

//#region [onMounted]
onMounted(() => {
  const {
    data,
    config: { zoomable },
  } = props;
  syncFromGlobal();
  const svg = d3.select(svgRef.value);

  const g = zoomable
    ? d3.select(gRef.value)
    : transformSvg(d3.select(gRef.value));

  internaldata = {
    svg,
    g,
  };
  internaldata.zoom = zoomable ? setUpZoom() : null;

  data && onData(data);
});

//#endregion 


//#region [Watch]

//#region [Watch - Sync global]
watch(
  () => props.config.sortBy,
  (curr, _) => {
    const {isSync} = props.config;
    if(isSync) global.sortBy = curr
    redraw();
  }
);

watch(
  () => props.config.selected,
  (curr, _) => {
    const {isSync} = props.config;
    if(isSync) global.selected = curr
    coloringLinks();
  }
);

watch(
  () => global,
  (_) => {
    syncFromGlobal()
  },
  { deep: true }
);

watch(
  ()=>props.config.isSync,
  (curr,_)=>{
    if(!global.sortBy && !global.selected.length){
      const {sortBy, selected}= props.config
      global.sortBy = sortBy;
      global.selected = selected;
      return
    }
    syncFromGlobal()
  }
);
//#endregion


watch(
  () => props.data,
  (curr, _) => {
    console.log(curr);
  }
);

watch(
  () => [props.config.expand.x, props.config.expand.y],
  ([newX, newY], [preX, preY]) => {
    redraw();
  }
);

watch(
  () => props.config.showLength,
  (curr, _) => {
    redraw();
  }
);

watch(
  () => props.config.style,
  (curr, _) => {
    redraw();
  },
  { deep: true }
);

watch(
  () => props.config.zoomable,
  (curr, _) => {
    if (curr) {
      internaldata.zoom = setUpZoom();
      return;
    }
    removeZoom();
  }
);

watch(
  () => props.config.resetZoom,
  (_) => resetZoom()
);

watch(
  () => props.config.resize,
  (_) => {
    param.padding = initPadding();
    resetZoom();
    redraw();
  }
);

watch(
  () => props.config.showTicklines,
  (_) => showTicklines()
);
//#endregion
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: 100%;
}


.svgWrapper{
  width: 100%;
  height: 100%;
  // border: 1px solid red;
}

:deep(.link-extensions) {
  fill: none;
  stroke: #000;
  stroke-opacity: 0.2;
  stroke-width: 0.5px;
}

:deep(.links) {
  fill: none;
  stroke: #000;
  stroke-width: 0.5px;
}

:deep(.tickLines) {
  stroke: #000;
  stroke-opacity: 0.2;
  stroke-width: 0.3px;
}

:deep(.link--active) {
  stroke: #f00 !important;
  stroke-width: 1.5px;
}

:deep(.link-extension--active) {
  stroke-opacity: 0.2;
}

:deep(.leaf--active text) {
  font-weight: bold;
  font-size: 10px;
  color: red
}
</style>
