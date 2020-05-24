/*
 * Scatterplot View - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'book aesthetic analysis'
 */
Scatterplot = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.initVis();
};

/*
 * Initialize visualization (static content; e.g. SVG area, scales)
 */
Scatterplot.prototype.initVis = function () {
    var vis = this;
    // Global variables for checking the array
    color_selection_global = null;
    error_selection_global = null;
    // Set color map
    vis.colorMap = {
        "red": "#d10b0c",
        "blue": "#0d68c3"
    };

    // Set margin and svg drawing area.
    vis.margin = {top: 30, right: 30, bottom: 30, left: 30},
        vis.width = $("#" + vis.parentElement).width()  - vis.margin.left - vis.margin.right,
        vis.height = 800 - vis.margin.top - vis.margin.bottom;

    // Draw SVG Element.
    vis.svg = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    // Set the radius
    vis.radius = 8;
    vis.error_limit = 10;

    // Define tooltip.
    var tip_circles = d3.tip()
        .attr('class', 'd3-tip-circles tooltip')
        .offset([-5, 10])
        .html(function(d) {
           // d['U/I']
            // return d['Q/I'] + ',' + d['U/I']
            return "<span> "
                + '<div class = "tooltip-color" >' + 'Q/I: ' +  d['Q/I'] + ' error in Q/I: ' + d['E_Q/I'] + "</div>"
                +'<div class = "tooltip-color" >' + 'U/I: ' +  d['U/I'] + ' error in U/I: ' + d['E_U/I'] + "</div>"
                + "</span>";

        });

    vis.svg.call(tip_circles);



    // Define scales for scatter plot.
    vis.x = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['Q/I']})).nice()
        .rangeRound([50, vis.width]);
    vis.y = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['U/I']})).nice()
        .rangeRound([vis.height - 90, 40]);
    vis.error_x = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['E_Q/I']})).nice()
        .rangeRound([0, vis.error_limit]);
    vis.error_y = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['E_U/I']})).nice()
        .rangeRound([0,vis.error_limit]);

    //Sequential greys for intensity.
    vis.intensityscale = d3.scaleSequential(d3.interpolateGreys)
        .domain(d3.extent(vis.data, function(d){return d['Flx(V)']}).reverse()).nice();
    // Define Axes for scatter plot

// Draw grid lines
    vis.data.forEach(function(d, i){
        var linedataHorizondal = [
            {"x": 50, "y": vis.y(d['U/I'])},
            {"x": vis.x(d['Q/I']), "y": vis.y(d['U/I'])}];

        var linedataVertical = [
            {"x": vis.x(d['Q/I']), "y": vis.height - 90},
            {"x": vis.x(d['Q/I']), "y": vis.y(d['U/I'])}];

        var lineFunction = d3.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;});

        vis.svg.append("path")
            .attr("d", lineFunction(linedataHorizondal))
            // .attr("class",  "horizondal")
            .attr('class', 'grids horizondal-grid horizondal-grid-'+ i + ' grids-' + i)
            .attr("stroke", "#DCDCDC")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        vis.svg.append("path")
            .attr("d", lineFunction(linedataVertical))
            // .attr("class",  "horizondal")
            .attr('class', 'grids vertical-grid vertical-grid-'+ i + ' grids-' + i)
            .attr("stroke", "#DCDCDC")
            .attr("stroke-width", 1)
            .attr("fill", "none");
    });

    // Set the default visibility of grid lines to zero.
    vis.svg.selectAll('.grids')
        .attr('opacity', 0);

    // Draw scatterplot.
    vis.svg.selectAll('.scatter-intensity')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', function(d,i){return 'scatter-point scatter-intensity scatter-intensity-'+ i + ' ' + i})
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])});

    // Draw eliipses for error
    vis.svg.selectAll('.scatter-error')
        .data(vis.data)
        .enter()
        .append('ellipse')
        .attr('class', function(d,i){return 'scatter-point scatter-error scatter-error-'+ i + ' ' + i})
        .attr('rx', function(d){return vis.error_x(d['E_Q/I']) + vis.radius} )
        .attr('ry', function(d){return vis.error_y(d['E_U/I']) + vis.radius} )
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('stroke', function(d){return vis.colorMap[d.color]})
        .attr('fill', 'none')
        .attr('opacity', 0.4);

    // Draw scatterplot for color
    vis.svg.selectAll('.scatter-color')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', function(d,i){return 'scatter-point scatter-color scatter-color-'+ i + ' ' + i})
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('fill', function(d){return vis.colorMap[d.color]})
        .attr('opacity', 0.2);

    // Draw scatterplot for formatting the journey of the scatterplot.
    vis.svg.selectAll('.scatter-journey')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', function(d,i){return 'scatter-point scatter-journey scatter-journey-'+ i + ' ' + i})
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('opacity', 0);

    // Plot Y axis
    vis.svg.append("g")
        .attr("class", "y_axis")
        .call(d3.axisLeft(vis.y))
        .attr("transform", "translate(50,0)")
        .selectAll("text")
        .style("font-size", 12)
        .attr('fill', '#A8A8A8');

    // Plot X axis
    vis.svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0,"+(vis.height-90)+")")
        // .call(d3.axisTop(vis.x))
        .call(d3.axisBottom(vis.x).ticks(20))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .attr('fill', '#A8A8A8');

    // add x label
    vis.svg.append("text")
        .attr("class", "x_axis_label")
        .text("Q/I")
        .attr("transform", "translate("+vis.width/2+", 680)");

    // add y label
    vis.svg.append("text")
        .attr("class", "y_axis_label")
        .text("U/I")
        .attr("transform", "translate(20,350) rotate(270)")
        .attr('fill', 'grey');

    // Set event handlers for changing the radio button.
    d3.selectAll("input[name='intensity']").on("change", function(){
        vis.intensity_selection = this.value;
        vis.updateVis();
    });
    d3.selectAll("input[name='color']").on("change", function(){
        vis.color_selection = this.value;
        color_selection_global = this.value;
        vis.updateVis();
    });
    d3.selectAll("input[name='error']").on("change", function(){
        vis.error_selection = this.value;
        error_selection_global = this.value;
        vis.updateVis();
    });

    // d3.selectAll('.scatter-journey').on("mouseover", tip_circles.show);
    d3.selectAll('.scatter-journey').on("mouseover", function(d)
    {
        var selectedIndex = d3.select(this).attr("class").split(' ')[3];

        vis.svg.selectAll('.scatter-journey-'+selectedIndex).classed('faded', true);

        vis.svg.selectAll('.scatter-intensity:not(.scatter-intensity-' + selectedIndex +')')
            .transition()
            .attr('opacity', 0.1);

        vis.svg.selectAll('.scatter-color:not(.scatter-color-' + selectedIndex +')')
            .transition()
            .attr('opacity', 0);

        vis.svg.selectAll('.scatter-error:not(.scatter-error-' + selectedIndex +')')
            .transition()
            .attr('opacity', 0);

        vis.svg.selectAll('.grids-'+ selectedIndex)
            .transition()
            .attr('opacity', 1);
        tip_circles.show(d);
    });

    d3.selectAll('.scatter-journey').on("mouseout", function(d)
    {
        vis.svg.selectAll('.faded')
            .attr('opacity', 0)
            .style("stroke-opacity", 0.5);

        vis.svg.selectAll('.faded').classed('faded', false);
        vis.svg.selectAll('.scatter-intensity').transition().attr('opacity', 1);
        vis.svg.selectAll('.scatter-color').transition().attr("opacity", function () {return (color_selection_global === 'enable') ? 0.3 : 0;});
        vis.svg.selectAll('.scatter-error').transition().attr("opacity", function () {return (error_selection_global === 'enable') ? 0.4 : 0;});
        vis.svg.selectAll('.grids').attr('opacity', 0);
        tip_circles.hide(d);
    });

    vis.updateVis();
};

/*
 * Update visualization on event handling
 */
Scatterplot.prototype.updateVis = function () {
    var vis = this;

    // Update with new data for intensity circles.
    var intensity = vis.svg.selectAll('.scatter-intensity')
        .data(vis.data);

    intensity
        .enter()
        .append("circle")
        .attr('class', function(d,i){return 'scatter-intensity '+ i})
        .merge(intensity)
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])});

    // Remove any filtered elements
    intensity.exit().remove();

    // Update with new data for error ellipses.
    var vis_error = vis.svg.selectAll('.scatter-error')
        .data(vis.data);

    vis_error
        .enter()
        .append("ellipse")
        .attr('class', function(d,i){return 'scatter-error '+ i})
        .merge(vis_error)
        .attr('rx', function(d){return vis.error_x(d['E_Q/I']) + vis.radius} )
        .attr('ry', function(d){return vis.error_y(d['E_U/I']) + vis.radius} )
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('stroke', function(d){return vis.colorMap[d.color]})
        .attr('fill', 'none')
        .attr('opacity', 0);

    // Remove any filtered elements
    vis_error.exit().remove();

    // Update with new data for color circles.
    var vis_color = vis.svg.selectAll('.scatter-color')
        .data(vis.data);

    vis_color
        .enter()
        .append("circle")
        .attr('class', function(d,i){return 'scatter-color '+ i})
        .merge(vis_color)
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('fill', function(d){return vis.colorMap[d.color]})
        .attr('opacity', 0);

    // Remove any filtered elements
    vis_color.exit().remove();

    // Update with new data for color circles.
    var vis_journey = vis.svg.selectAll('.scatter-journey')
        .data(vis.data);

    vis_journey
        .enter()
        .append("circle")
        .attr('class', function(d,i){return 'scatter-journey '+ i})
        .merge(vis_journey)
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        .attr('fill', function(d){return vis.colorMap[d.color]})
        .attr('opacity', 0);

    // Remove any filtered elements
    vis_journey.exit().remove();


// Change attributes based on radio button selections.
    vis.svg.selectAll('.scatter-intensity')
        .transition()
        .attr("fill",
            function (d,i) {
                if (vis.intensity_selection === 'enable') {return vis.intensityscale(vis.data[i]['Flx(V)']);}
                else if (vis.intensity_selection === 'disable'|| vis.intensity_selection == null ) {return '#D0D0D0';}
            });

    vis.svg.selectAll('.scatter-color')
        .transition()
        .attr("opacity",
            function () {
                if (vis.color_selection === 'enable') {return 0.3;}
                else if (vis.color_selection === 'disable'|| vis.color_selection == null) {return 0;}
            });

    vis.svg.selectAll('.scatter-error')
        .transition()
        .attr("opacity",
            function () {
                if (vis.error_selection === 'enable') {return 0.4;}
                else if (vis.error_selection === 'disable'|| vis.error_selection == null) {return 0;}
            });

    // if (vis.currentIndex != null){
    //
    //     vis.svg.selectAll('.selected').classed('selected', false);
    //
    //     vis.timescale = d3.scaleLinear()
    //         .domain(d3.extent(vis.data.filter(function(d){return d.index <= vis.currentIndex}),
    //         function(d){return d.JD}))
    //         .range([3, 20]);
    //
    //     // var highlight_scope = vis.data.filter(function(d){return d.index <= vis.currentIndex}).map(a => a.index);
    //
    //     vis.svg.selectAll('.scatter-color')
    //         .filter(function(d){return d.index <= vis.currentIndex})
    //         .classed('selected', true);
    //
    //     vis.svg.selectAll('.scatter-color:not(.selected)')
    //         .classed('faded', true);
    //
    //     vis.svg.selectAll('.selected')
    //         .transition()
    //         .attr("r",
    //             function (d,i) {
    //                 return vis.timescale(vis.data[i]['JD'])
    //             })
    //         .attr('fill', 'orange')
    //         .attr("opacity", 0.6);
    // }
};

/*
 * Filter data when the user changes the selection on slider
 */
Scatterplot.prototype.selectionChanged = function (rangeRegion) {
    var vis = this;
    // Update the data property to the filtered dataset.
    vis.data = rangeRegion;
    // Update the visualization
    vis.updateVis();
};

/*
 * Filter data when the user changes the selection on slider
 */
Scatterplot.prototype.selectionClicked = function (classIndex) {
    var vis = this;
    // Update the data property to the filtered dataset.
    vis.currentIndex = classIndex;
    // Update the visualization
    vis.updateVis();
};