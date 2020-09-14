const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const chosen_data = d3.json("./data/actions/heroActions/chosenActions.json").then(function(data) {
    update(data, "blue");
});
const blacksmith_data = d3.json("./data/actions/smithActions/blackSmithActions.json").then(function(data) {
    update(data, "red");
});


function update(new_data, color) { 
    const role = new_data.role;
    const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
    // Group used to enforce margin
    const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    const bar_height = 50;
    
    // DATA JOIN
const rect = g
    .selectAll("rect")
    .data(new_data.actions)
    .join(
        // ENTER
        // new elements
        (enter) => {
            const rect_enter = enter.append("circle")
            .attr("cx", 50)
                .attr("cy", 20)
                .attr("r", 10)
                .style("fill", color);
                rect_enter.append("title");
                return rect_enter;
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
    rect
    .attr("cy", (d, i) => i * (bar_height + 5));
    
    rect.select("title").text((d) => `value: ${d}`);  
}
        // Creates sources <svg> element

// Global variable for all data