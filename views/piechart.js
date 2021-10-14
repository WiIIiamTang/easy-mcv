export const createPieChart = (svgSelector, stateAttr, colorScheme, name_en, name_fr, state, updateApp) => {
    const margin = 10;
    var margin_right = 50;
    var radius = 180;

    var width;
    if ($(window).width() >= 767) {
        width = radius * 2 + margin * 2 + 180;
    } else {
        width = radius * 2 + margin * 2 + 120;
        radius = 150;
    }
    const height = radius * 2 + margin * 2;

    // svg
    const svg = d3
        .select(svgSelector).append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        // .attr("width", width)
        // .attr("height", height);

    // group to control margin
    const g = svg.append("g").attr("transform", `translate(${radius + margin - margin_right +40},${radius + margin})`);

    // tooltip setup
    var tooltip = d3.select(svgSelector)
    .append('div')               
    // 'tooltipPie' is the class used for pie chart (donut) tooltips                  
    .attr('class', 'tooltipPie');

    tooltip.append('div')                           
    .attr('class', 'label');                        

    tooltip.append('div')
    // count for total number in a slice               
    .attr('class', 'count');

    // d3 pie (no sort to not interfere with animations)
    const pie = d3
        .pie()
        .value((d) => {
            return d.values.length
        })
        .sortValues(null)
        .sort(null);
    
    // donut with innerRadius
    const arc = d3.arc().outerRadius(radius).innerRadius(radius*0.5);

    // colors
    const cscale = d3.scaleOrdinal(colorScheme);

    // middle text
    const middle = g.append("text").attr("text-anchor", "middle");

    // return the update function
    return (new_data, lang) => {
        // create the d3 pie data
        const pied = pie(new_data);

        middle.text(new_data.reduce((acc, curr) => acc + curr.values.length, 0));

        // set new colors
        cscale.domain(new_data.map((d) => d.key));

        // remember old paths for transition animations on arcs
        // use tweenArc to define exit animation
        const old = g.selectAll("path").data();
        const tweenArc = (d, i) => {
            const interpolate = d3.interpolateObject(old[i], d);
            return (t) => arc(interpolate(t));
        }

        // render the new graph
        const path = g
        .selectAll("path")
        .data(pied, (d) => d.data.key)
        .join(
            // enter new paths
            (enter) => {
                const path_enter = enter
                    .append("path")
                    .on("click", (e, d) => {
                        // add or remove from state filters on click
                        console.log(state.data);
                        if (state[stateAttr].includes(d.data.key)) {
                            state[stateAttr] = state[stateAttr].filter((a) => a !== d.data.key);
                            $('#'+stateAttr+d.data.key.replaceAll(" ", "-")).remove();
                        } else {
                            state[stateAttr].push(d.data.key);
                            $('#statusContent').append("<div class='statusItem' id='"+stateAttr+d.data.key.replaceAll(" ", "-")+"'>"+(lang==='en' ? name_en : name_fr)+": "+d.data.key+"</div>")
                        }
                        updateApp();
                    });
                return path_enter;
            },
            // update paths
            (update) => update,
            // remove paths not part of new data with the tweenarc function
            (exit) => exit.transition().duration(1000).attrTween("d", tweenArc).remove()
        );

        // add transition to paths on new graph, add the new colors
        path
            .transition()
            .duration(750)
            .attrTween("d", tweenArc)
            .style("fill", (d) => cscale(d.data.key));

        // set functions for tooltip on hover
        path.on('mouseover', (e, d) => {
            tooltip.select('.label').html(d.data.key);        
            tooltip.select('.count').html(d.data.values.length);                  
            tooltip.style('display', 'block');         
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .on('mousemove', (e, d) => {
            // the offset here should be adjusted if the tooltip is breaking
            // on different browsers
            tooltip.style('top', (e.pageY - 80) + 'px')
            .style('left', (e.pageX - 90) + 'px');
        });

        addLegend(cscale, new_data.map((d) => {
            if (d.key.startsWith("Prefer")) {
                return "Prefer no answer";
            } else
                return d.key;
        }));
    };

    function addLegend(scale_c, labels) {
        svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate("+ (width-margin_right-150) + ",20)");
        
        var colorLegend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .cells(7)
            .title("")
            .labels(labels)
            .scale(scale_c);
        
        svg.select(".legend")
            .call(colorLegend);
    }
};

export const get_piechart_view = (filter, wrangle, svgSelector, stateAttr, name_en, name_fr, colorScheme = null) => {
    return {
        filter: filter,
        wrangle: wrangle,
        _fn: createPieChart,
        svgSelector: svgSelector,
        stateAttr: stateAttr,
        name_en: name_en,
        name_fr: name_fr,
        colorScheme: colorScheme
    }
};