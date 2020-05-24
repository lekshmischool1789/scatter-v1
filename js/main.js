// Variable for innovative view

var vis = {};

queue()
    .defer(d3.csv,"data/transformed_blazar_1.csv")
    .await(createVis);

function createVis(error, data) {
    if (error) {
        console.log(error);
    }
    //Convert text to numbers.
    data.forEach(function(d, i){
        d['index'] = i;
        d['Flx(V)'] = +d['Flx(V)'];
        d['V-J'] = +d['V-J'];
        d['color-val'] = '';
        d['color-val-lab'] = '';
        d['color-val-more'] = '';
        d['Flx(V)_transformed'] = +d['Flx(V)_transformed'];
        d['V-J_transformed'] = +d['V-J_transformed'];
        // TO BE UPDATED. I chose MEDIAN TO MAKE V - J VALUES BINARY
        if (d['V-J_transformed'] < 0.5){d['color'] = 210 } else {d['color'] = 0};
    });
vis.parentElement = 'viz-container';
vis.data = data;
vis.radius = 7;


    // Define the SVG element
    // Set margin and svg drawing area.
    vis.margin = {top: 20, right: 20, bottom: 20, left: 20},
        vis.width = $("#" + vis.parentElement).width()  - vis.margin.left - vis.margin.right,
        vis.height = $(document).height() /1.2- vis.margin.top - vis.margin.bottom;

    // Draw SVG Element.
    vis.svg = d3.selectAll("#" + vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    // // Create a definitions element to create the blur elements
    var defs = vis.svg.append("defs");
    // Add a filter
    var filter = defs.append("filter")
        .attr("id","halo");
    // define the filter for the blur
    filter.append("feGaussianBlur")
        .attr("stdDeviation","0.5")
        .attr("result","coloredBlur");
    // Add merge to define the graphic
    // var feMerge = filter.append("feMerge");
    // feMerge.append("feMergeNode")
    //     .attr("in","coloredBlur");
    // feMerge.append("feMergeNode")
    //     .attr("in","SourceGraphic");

    // Define X & Y Scales
    vis.x = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['Q/I']})).nice()
        .rangeRound([40*vis.margin.left, vis.width]);
    vis.y = d3.scaleLinear()
        .domain(d3.extent(vis.data, function(d){return d['U/I']})).nice()
        .rangeRound([vis.height*0.7, vis.margin.top]);

    //Define intensity scales
    // var intensity_hue = d3.hsl(#A8A8A8).h;

    vis.intensityscale = d3.scaleLinear()
        .domain(d3.extent(data, function(d){return d['Flx(V)_transformed']})).nice()
        .range([10, 100]);

    // var piecewiseColor = d3.interpolateRgbBasis(['#000249', 'steelblue','#0F4392','#FF4949', '#DD1717']);

    //Define simple color mapping using linear scales
    vis.updatedSequentialScale = d3.scaleSequential()
        .domain(d3.extent(vis.data, function(d){return d['V-J']}))
        .interpolator(d3.piecewise(d3.interpolateLab, ["#0000ff", "#0084ff", "#bb9db8", "#ffb000", "#ff0000"]));

    // Draw scatterplot.
    vis.svg.selectAll('.scatter-point')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', function(){return 'scatter-point'})
        .attr('r', vis.radius)
        .attr('cx', function(d){return vis.x(d['Q/I'])})
        .attr('cy', function(d){return vis.y(d['U/I'])})
        // .attr('fill','#A8A8A8');
        .attr('fill', '#202021');

        // .attr('fill', function(d,i){return d3.color('hsl(0, 0%,' + Math.round(vis.intensityscale(data[i]['Flx(V)_transformed'])) + '%)').rgb()})
};

console.log(d3.selectAll("#intensity").property('checked'));

function intensity_update() {
    if(d3.selectAll("#intensity").property('checked') == true)
 {
        var u = vis.svg.selectAll('.scatter-point')
            .data(vis.data);
        u
            .enter()
            .append('circle')
            .attr('r', vis.radius)
            .attr('cx', function (d) {
                return vis.x(d['Q/I'])
            })
            .attr('cy', function (d) {
                return vis.y(d['U/I'])
            })
            .attr('fill', '#202021')
            .merge(u)
            .transition()
            .duration(500)
            .attr('stroke', function (d, i) {
                return d3.color('hsl(0, 0%,' + Math.round(vis.intensityscale(vis.data[i]['Flx(V)_transformed'])) + '%)').rgb()
            })
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 1)
            // .style("filter", "url(#halo)");

 }
    if(d3.selectAll("#intensity").property('checked') == false)
    {
        var u = vis.svg.selectAll('.scatter-point')
            .data(vis.data);
        u .transition()
            .duration(500)
            // .attr('fill', '#202021')
            .attr('stroke-opacity', 0)
            .style("filter", "none");


    }

        };

function color_update() {

    if(d3.selectAll("#color").property('checked') == true && d3.selectAll("#intensity").property('checked') == false)
    {

        var u = vis.svg.selectAll('.scatter-point')
            .data(vis.data);
        u
            .transition()
            .duration(500)
            .attr("fill",
                function (d,i) {
                var color = d3.hsl(vis.updatedSequentialScale(vis.data[i]['V-J']));
                color.s = 0.6;
                color.l = 0.3;
                    // console.log(color);
                return (color)
                    // return vis.updatedSequentialScale(vis.data[i]['V-J'])
                    // sequentialScale(data[i]['V-J']);
                })
    }

    if(d3.selectAll("#color").property('checked') == true && d3.selectAll("#intensity").property('checked') == true)
    {

        var u = vis.svg.selectAll('.scatter-point')
            .data(vis.data);
        u
            .transition()
            .duration(500)
            .attr("fill",
                function (d,i) {
                        var color = d3.hsl(vis.updatedSequentialScale(vis.data[i]['V-J']));
                        color.s = 0.6;
                        color.l = 0.3;
                        // console.log(color);
                        return (color)
                    // return vis.updatedSequentialScale(vis.data[i]['V-J'])
                })
            .attr('stroke', function (d, i) {
                return d3.color('hsl(0, 0%,' + Math.round(vis.intensityscale(vis.data[i]['Flx(V)_transformed'])) + '%)').rgb()
            })
            .attr('stroke-width',  1)
            .attr('stroke-opacity', 1)
    }

    if(d3.selectAll("#color").property('checked') == false)
    {
        var u = vis.svg.selectAll('.scatter-point')
            .data(vis.data);
        u .transition()
            .duration(500)
            .attr('fill', '#202021')
            .attr('stroke-opacity', function(){if(d3.selectAll("#intensity").property('checked') == false){return 0}
            else {return 1}})
            // .attr("fill",
            //     function (d,i) {
            //         var hue = d3.hsl(vis.updatedSequentialScale(vis.data[i]['V-J'])).h;
            //         // var color =
            //         return d3.color('hsl(' + hue +', 40%,' + Math.round(vis.intensityscale(vis.data[i]['Flx(V)_transformed'])) + '%)').rgb();
            //         // sequentialScale(data[i]['V-J']);
            //     })

    }

};