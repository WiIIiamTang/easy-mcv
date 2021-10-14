/**
 * Creates a histogram (binned bars [x, y) ) at the given div selector.
 * Returns the update function for that graph.
 */
 export const createHistogram = (svgSelector, stateAttr, colorScheme=null, name_en, name_fr, state, updateApp) => {
    const margin = {
        top: 10,
        bottom: 40,
        left: 20,
        right: 10,
    };

    var width;
    if ($(window).width() >= 767) {
        width = 375 - margin.left - margin.right;
    } else {
        width = 275 - margin.left - margin.right;
    }
    const height = 400 - margin.top - margin.bottom;

    // svg element
    const svg = d3
        .select(svgSelector).append("svg")
        .attr("viewBox", `0 0 ${width+margin.left+margin.right+125} ${height+margin.top+margin.bottom}`)
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom);

    // group for margin control
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // xy scales
    const xscale = d3.scaleLinear().range([0, width]);
    const yscale = d3.scaleLinear().range([0, height]);

    // xy axis - put x on bottom
    const xaxis = d3.axisBottom().scale(xscale);
    const g_xaxis = g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")");
    const yaxis = d3.axisLeft().scale(yscale);
    const g_yaxis = g.append("g").attr("class", "y axis");

    // Return the update function
    return (new_data, lang) => {
        // set new domains depending on data
        xscale.domain([0, d3.max(new_data, (d) => d.length) + 5]);
        yscale.domain([new_data[0].x0, new_data[new_data.length - 1].x1]);

        // render the axes
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);

        // render the graph
        const rect = g
        .selectAll("rect")
        .data(new_data)
        .join(
            (enter) => {
                // new elements enter
                const rect_enter = enter
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    .style("cursor", "pointer")
                    .on("click", (e, d) => {
                        // add or remove to the state filters on click
                        var add_to_state = true;
                        state[stateAttr].forEach((age) => {
                            if (age.low === d.x0 && age.high === d.x1) {
                                add_to_state = false;
                            }
                        })
                        if (add_to_state) {
                            state[stateAttr].push({low: d.x0, high: d.x1});
                            $('#statusContent').append("<div class='statusItem' id='"+stateAttr+d.x0+"-"+d.x1+"'>"+(lang==='en' ? name_en : name_fr)+": "+d.x0+"-"+d.x1+"</div>");
                        } else {
                            state[stateAttr] = state[stateAttr].filter((age) => age.low !== d.x0 || age.high !== d.x1)
                            $('#'+stateAttr+d.x0+"-"+d.x1).remove();
                        }
                        updateApp();
                    });
                // add info on hover
                rect_enter.append("title");
                return rect_enter;
            },
            // update elements
            (update) => update,
            // remove elements not part of data anymore
            (exit) => exit.remove()
        )
        .style("fill", "#69b3c8");

        // updating and entering old and new elements with transition
        rect
            .transition().duration(800).ease(d3.easeSin)
            .attr("height", (d) => yscale(d.x1) - yscale(d.x0) - 2)
            .attr("width", (d) => xscale(d.length))
            .attr("y", (d) => yscale(d.x0) + 1);

        // set info on hover to the title element
        rect.select("title").text((d) => `${d.x0}-${d.x1}: ${d.length}`);
    };
};

export const get_histogram_view = (filter, wrangle, svgSelector, stateAttr, name_en, name_fr) => {
    return {
        filter: filter,
        wrangle: wrangle,
        _fn: createHistogram,
        svgSelector: svgSelector,
        stateAttr: stateAttr,
        name_en: name_en,
        name_fr: name_fr
    }
};