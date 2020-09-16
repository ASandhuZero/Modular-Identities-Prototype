const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


function setUp() {

    Promise.all([
        d3.json("./data/actions/heroActions/chosenActions.json"),
        d3.json("./data/actions/heroActions/heroBlends.json"),
        d3.json("./data/actions/smithActions/blackSmithActions.json"),
    d3.json("./data/actions/smithActions/smithBlends.json")
    ]).then(function(files) {
        //ideally we take all the files, create single structure with all
        // links, targets, and sources. 
        // From there we should be able to pass it into the tree visual?
        // link structure = {"source" : data, "target" : data, "type": data}
        // node structure = {id : data}
       let nodeData = []
       let linkData = []
       // TODO: Get rid of this or do something else with it.
       let types = [];
        let colors = [d3.rgb(149, 125, 173), d3.rgb(254, 200, 216)]
        for (let i = 0; i < files.length; i ++) {
            let rawData = files[i];
            let formattedData = formatData(rawData);
            nodeData = nodeData.concat(formattedData.nodes);
            linkData = linkData.concat(formattedData.links);
            // treeUpdate(files[i], colors[i]);
        }
        console.log(nodeData, "this is the node data")
        console.log(linkData, "this is the link data")
        forcesSim(nodeData, linkData, types);
    });
}

function formatData(data) {
    let formattedData = {
        "nodes" : [],
        "links" : []
    }
    let role = data.role;
    let actions = data.actions;
    for (let i = 0; i < actions.length; i++) {
        let action = actions[i];
        let node = {
            id : action.name,
            data : action
        }
        formattedData.nodes.push(node);
        let children = action.leadsTo? action.leadsTo : 0;
        for (let j = 0; j < children.length; j++) {
            let child = children[j];
            let link = {
                source : action.name,
                target : child,
                type : role,
                data : child
            }
            formattedData.links.push(link);
        }

    }
    console.log(data);

    return formattedData;
}

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

function forcesSim(nodeData, linkData, types) {
  const links = linkData.map(d => Object.create(d));
  const nodes = nodeData.map(d => Object.create(d));


    let drag = simulation => {
    
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  const color = d3.scaleOrdinal(types, d3.schemeCategory10)
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  const svg = d3
        .select('body')
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("font", "12px sans-serif");

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
    .data(types)
    .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");

  const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("stroke", d => color(d.type))
      .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

  const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(nodes)
    .join("g")
      .call(drag(simulation));

  node.append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("r", 4);

  node.append("text")
      .attr("x", 8)
      .attr("y", "0.31em")
      .text(d => d.id)
    .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  return svg.node();
}

function update(newData, color) { 
    const role = newData.role;
    const svg = d3
        .select("body")
        .append("svg")
        .text(role)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    // Group used to enforce margin
    const group = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    const bar_height = 50;
    
    // DATA JOIN
    const circle = group
        .selectAll("circle")
        .data(newData.actions)
        .join(
            // ENTER
            // new elements
            (enter) => {
                const node = enter.append('g');
                node.append("circle")
                    .attr("cx", 150)
                    .attr("cy", 20)
                    .attr("r", 10)
                    .style("fill", color);
                node.append('text')
                    .attr("x", 100)
                    .attr("y", "0.31em")
                    .text(function(d) { return d.name; })
                return node;
            },
            // UPDATE
            // update existing elements
            (update) => update,
                // EXIT
                // elements that aren't associated with data
            (exit) => exit.remove()
        );

    // ENTER + UPDATE
    // both old and new elements
    circle
        .attr("transform",function(d, i) { return "translate("+[50,100*i]+")";});
}

setUp();