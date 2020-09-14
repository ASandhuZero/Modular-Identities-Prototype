const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const chosen_data = d3.json("./data/actions/heroActions/chosenActions.json").then(function(data) {
    update(data, d3.rgb(149, 125, 173));
});
const blacksmith_data = d3.json("./data/actions/smithActions/blackSmithActions.json").then(function(data) {
    update(data, d3.rgb(254, 200, 216));
});

function update(new_data, color) { 
    const role = new_data.role;
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
        .data(new_data.actions)
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