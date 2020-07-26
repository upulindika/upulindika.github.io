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


        var tip = d3.tip().attr('class', 'd3-tip')
            .html(function (usMapDataForAState) {
                var stateData = fetchAStateData(usMapDataForAState);

                var content = "<span style='margin-left: 2.5px;'><h6>" + usMapDataForAState.properties.name + "</h6></span>";
                content += "<span ><h6>Total Cases: " + stateData[0].Total_Cases + "</h6></span>";
                content += "<span ><h6>Cases in Last 7 Days: " + stateData[0].CasesInLast7Days + "</h6></span>";
                content += "<span ><h6>Cases/100K: " + stateData[0].RatePer100000 + "</h6></span>";
                content += "<span ><h6>Total Deaths: " + stateData[0].Total_Death + "</h6></span>";
                return content;
            });
        svg.call(tip);
        //Setting geoPath
        var path = d3.geoPath();

        //Creating legend for maps

        //Creating legend for maps

        var log = d3.scaleLog()
            .domain([6165, 16456, 33503, 72280, 176551, 366164])
            .range(['#fff7bc', '#fec44f', '#d95f0e']);

        svg.append("g")
            .attr("class", "legendLog")
            .attr("transform", "translate(20,20)");

        var logLegend = d3.legendColor()
            .cells([6165, 16456, 33503, 72280, 176551, 366164])
            .scale(log)
            .labelFormat(d3.format(".0f"));

        svg.select(".legendLog")
            .call(logLegend);


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
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide);

            g.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));
            var annotations = [{
                note: {
                    align: "right",
                    label: "Has highest number of Cases: 405,931",
                    title: "New York",
                },
                connector: {
                    end: "dot",
                    type: "line",
                    lineType: "vertical",
                    endScale: 2
                },
                color: ["red"],
                x: 900, y: 215,
                dy: -80,
                dx: 0

            }];
            const makeAnnotations = d3.annotation()
                .editMode(false)
                .annotations(annotations);

            svg.append("g")
                .attr("class", "annotation-01")
                .call(makeAnnotations);

            d3.select(svgId).selectAll(".connector")
                .attr('stroke', "red")
                .style("stroke-dasharray", ("3, 3"));

            d3.select(svgId).selectAll(".connector-end")
                .attr('stroke', "red")
                .attr('fill', "red")


        });


    });

}


renderUSMap("#map-svg");


function fetchAStateData(usMapDataForAState) {
    return usMapdataState.filter(usDataStateItem => usDataStateItem.jurisdiction.toUpperCase() === usMapDataForAState.properties.name.toUpperCase());
}

