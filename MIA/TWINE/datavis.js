const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


function setUp() {

    const chosen_data = d3.json("./data/actions/heroActions/chosenActions.json").then(function(data) {
        update(data, d3.rgb(149, 125, 173));
    });
    const blacksmith_data = d3.json("./data/actions/smithActions/blackSmithActions.json").then(function(data) {
        // update(data, d3.rgb(254, 200, 216));
        // test(data, d3.rgb(254, 200, 216));
        testTree(data, d3.rgb(254, 200, 216));
    });
    console.log('ran')
}

function parseData(data) {
    let formattedData = {}
    let actions = data.actions;
    let formattedActions = [];
    //TODO: Your formatting is wrong. Deal with this nightmare please jesus.
    for (let i = 0; i < actions.length; i++) {
        let x = 0;
        if (actions[i].leadsTo !== undefined) {
            let formattedAction = actions[i];
            if (formattedAction.x === undefined) {
                formattedAction.x = x;
                x = x + 100;
            }
            formattedAction.children = [];
            let children = actions[i].leadsTo;
            for (let j = 0; j < children.length; j++) {
                
                let child = children[j];
                for (let k = 0; k < actions.length; k++) {
                    if (actions[k].name === child) {
                        child = actions[k];
                        child.x = x + 100;
                        child.parent = formattedAction.name;
                        break;
                    }
                }
                formattedAction.children.push(child);
            }
            formattedActions.push(formattedAction);
        }
    }
    console.log(formattedActions);
    return formattedActions;
}


function testTree(data) {
    console.log("ran")
    let formattedData = parseData(data);
    data = formattedData[0]
    tree = data => {
        const root = d3.hierarchy(data);
        root.dx = 10;
        root.dy = width / (root.height + 1);
        return d3.tree().nodeSize([root.dx, root.dy])(root);
    }
    const root = tree(data);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    const svg = d3
        .select("body")
        .append("svg")
        .attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 2]);
    
    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);
        
    const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
    .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
    
    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");
    
    return svg.node();
}






function test(newData, color) {
    let formattedData = parseData(newData);
    let treeData = formattedData[0];
    var width = 960,
        height = 500;

    // append the svg object to the body of the page
    const svg = d3
        .select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr('transform',`translate(100,${height/2})`)


    const duration = 750;
    let i = 0,
        root = d3.hierarchy(treeData, function(d) {
            return d.children;
        });

    // Collapse after second level
    root.children.forEach(collapse);
    root.x0 = 0;
    root.y0 = 0;
  
    // Reverse size parameters, in order to maintain order in horizontal layout 
    loopOverHierarchy(treeData,d=>{
      if(Array.isArray(d.size)){
        if(!d._size) d._size = d.size.slice();
        d.size = d._size.slice().reverse();
      }
    })

   
    const layout = d3.tree(root);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
        if (d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }
  
    function loopOverHierarchy(d,callback){
      callback(d);
      if(d.children) d.children.forEach(c=>loopOverHierarchy(c,callback))
      if(d._children) d._children.forEach(c=>loopOverHierarchy(c,callback))
    }

    function update(source) {
        
        // Assigns the x and y position to the nodes
        var treeData = layout(root);
      
        // Switch x and y coordinates for horizontal layout
        treeData.each(d=>{
          const x = d.x;
          d.x = d.y;
          d.y = x;
        })

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = g.selectAll('g.node')
            .data(nodes, d=> d.id || (d.id = ++i));

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr('pointer-events', 'none')
            .attr('dy', '0.35em')
            .text(function(d) {
                return d.data.name;
            })
            .attr('text-anchor', 'middle')

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node)
            .attr("fill", "#fff")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "3px;")
            .style('font', '12px sans-serif')

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(event, i, arr) {
                const d = d3.select(this).datum();
                console.log(d);
                let x = d.data.x;
                let y = (50 * i) % 200;
                return "translate(" + x + "," + y + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 20)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(event, i, arr) {
                const d = d3.select(this).datum();
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6)



        // ****************** links section ***************************

        // Update the links...
        var link = g.selectAll('path.link')
            .data(links, function(d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                }
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", "2px")

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(event, i, arr) {
                const d = d3.select(this).datum();
                var o = {
                    x: source.x,
                    y: source.y
                }
                return diagonal(o, o)
            }).remove();

        // Store the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            const path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`

            return path
        }

        // Toggle children on click.
        function click(event, d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }

    return svg.node()
}


// function test(newData, color) {
    // let formattedData = parseData(newData);
    // let treeData = formattedData[0];
//     //TODO: This is where you have to do children parsing I think
//     // hierarchy has a second parameter
//     let testRoot = d3.hierarchy(root, d => {
//         if (d.children !== undefined) return d.children;
//     }); 
//     let tree = d3.tree(testRoot);
//     debugger;
//     update(testRoot, color);
// }


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