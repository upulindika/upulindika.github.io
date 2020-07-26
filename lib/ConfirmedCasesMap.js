function renderUSMap(svgId) {
    d3.csv('data/us_map_data.csv').then(function (usMapData) {

        var mapWIDTH = 1000, mapHEIGHT = 700;
        var margin = {top: 40, right: 20, bottom: 50, left: 70},
            width = mapWIDTH - margin.left - margin.right,
            height = mapHEIGHT - margin.top - margin.bottom;
        var svg = d3.select(svgId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);


        usMapdataState = usMapData;

        var tooltip = d3.select(svgId).append("div")
            .attr("class", "tooltipcharts")
            .style("opacity", 0);
        // tooltip mouseover event handler
        var tipMouseover = function (usMapDataForAState) {
            var stateData = fetchAStateData(usMapDataForAState);

            var html = "<span style='margin-left: 2.5px;'><h6>" + usMapDataForAState.properties.name + "</h6></span>";
            html += "<span ><h6>Total Cases: " + stateData[0].Total_Cases + "</h6></span>";
            html += "<span ><h6>Cases in Last 7 Days: " + stateData[0].CasesInLast7Days + "</h6></span>";
            html += "<span ><h6>Cases/100K: " + stateData[0].RatePer100000 + "</h6></span>";
            html += "<span ><h6>Total Deaths: " + stateData[0].Total_Death + "</h6></span>";

            tooltip.html(html)
                .style("left", d3.event.pageX - 400 + "px")
                .style("top", d3.event.pageY - 150 + "px")
                .transition()
                .duration(200) // ms
                .style("opacity", .9)

        };
        // tooltip mouseout event handler
        var tipMouseout = function (d) {
            tooltip.transition()
                .duration(300) // ms
                .style("opacity", 0);
        };

        //Setting geoPath
        var path = d3.geoPath();

        //Creating legend for maps
        svg.append("g")
            .html("<g class=\"legendLog\" transform=\"translate(0,20)\"><g class=\"legendCells\"><g class=\"cell\"" +
                " transform=\"translate(0, 0)\"><rect class=\"swatch\" height=\"15\" width=\"15\" style=\"fill: " +
                "rgb(255, 247, 188);\"></rect><text class=\"label\" transform=\"translate(20,12.5)\" " +
                "font-size=\"smaller\">0 to 6165</text></g><g class=\"cell\" transform=\"translate(0, 17)\">" +
                "<rect class=\"swatch\" height=\"15\" width=\"15\" style=\"fill: rgb(254, 196, 79);\"></rect>" +
                "<text class=\"label\" transform=\"translate(20,12.5)\" font-size=\"smaller\">6166 to 16456</text>" +
                "</g><g class=\"cell\" transform=\"translate(0, 34)\"><rect class=\"swatch\" height=\"15\" width=\"15\" " +
                "style=\"fill: rgb(217, 95, 14);\"></rect><text class=\"label\" transform=\"translate(20,12.5)\"" +
                " font-size=\"smaller\">16457 to 33503</text></g><g class=\"cell\" transform=\"translate(0, 51)\">" +
                "<rect class=\"swatch\" height=\"15\" width=\"15\" style=\"fill: rgb(177, 0, 0);\"></rect><text " +
                "class=\"label\" transform=\"translate(20,12.5)\" font-size=\"smaller\">33504 to 72280</text></g>" +
                "<g class=\"cell\" transform=\"translate(0, 68)\"><rect class=\"swatch\" height=\"15\" width=\"15\"" +
                " style=\"fill: rgb(131, 0, 0);\"></rect><text class=\"label\" transform=\"translate(20,12.5)\" " +
                "font-size=\"smaller\">72281 to 176551</text></g><g class=\"cell\" transform=\"translate(0, 85)\">" +
                "<rect class=\"swatch\" height=\"15\" width=\"15\" style=\"fill: rgb(93, 0, 0);\"></rect><text " +
                "class=\"label\" transform=\"translate(20,12.5)\" font-size=\"smaller\">176552 to 366164</text></g>" +
                "</g></g>");

        var cScale = d3.scaleSequential()
            .interpolator(d3.interpolateYlOrBr)
            .domain([0, 1000]);
        var logScalex = d3.scaleLog().domain([1000, 366164]).range([0, 1000]);


        d3.json("data/us-10m.v2.json").then(function (us) {
            var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            g.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("fill", function (usMapDataForAState) {
                    var stateData = fetchAStateData(usMapDataForAState);
                    return cScale(logScalex(stateData[0].Total_Cases));
                })

                .attr("d", path)
                .on("mouseover", tipMouseover)
                .on("mouseout", tipMouseout);

            g.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

            svg.append("g").html("<g class=\"annotation-01\"><g class=\"annotations\">" +
                "<g class=\"annotation callout  \" transform=\"translate(900, 215)\"><g class=\"annotation-connector\">" +
                "<path class=\"connector\" d=\"M0,0L0,-80\" stroke=\"red\" fill=\"none\"" +
                " style=\"stroke-dasharray: 3, 3;\"></path><path class=\"connector-end connector-dot\" " +
                "d=\"M2.59786816870648e-16,-4.242640687119286A4.242640687119286,4.242640687119286,0,1,1," +
                "-2.59786816870648e-16,4.242640687119286A4.242640687119286,4.242640687119286,0,1,1,2.59786816870648e-16," +
                "-4.242640687119286Z\" transform=\"translate(0, 0)\" fill=\"red\" stroke=\"red\"></path></g>" +
                "<g class=\"annotation-subject\"></g><g class=\"annotation-note\" transform=\"translate(0, -80)\">" +
                "<g class=\"annotation-note-content\" transform=\"translate(-112.078125, -80.2890625)\">" +
                "<rect class=\"annotation-note-bg\" width=\"112.078125\" height=\"77.2890625\" x=\"0\" y=\"0\" " +
                "fill=\"white\" fill-opacity=\"0\"></rect><text class=\"annotation-note-label\" dx=\"0\" " +
                "y=\"20.3671875\" fill=\"red\"><tspan x=\"0\" dy=\"0.8em\">Has highest</tspan><tspan x=\"0\" " +
                "dy=\"1.2em\">number of</tspan><tspan x=\"0\" dy=\"1.2em\">Cases: 405,931</tspan></text><text " +
                "class=\"annotation-note-title\" fill=\"red\" font-weight=\"bold\"><tspan x=\"0\" dy=\"0.8em\">New York" +
                "</tspan></text></g><path class=\"note-line\" d=\"M-112.078125,0L0,0\" stroke=\"red\"></path></g>" +
                "</g></g></g>");


        });


    });

}


renderUSMap("#map-svg");


function fetchAStateData(usMapDataForAState) {
    return usMapdataState.filter(usDataStateItem => usDataStateItem.jurisdiction.toUpperCase() === usMapDataForAState.properties.name.toUpperCase());
}

