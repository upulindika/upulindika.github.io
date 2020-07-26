const WIDTH = 1000, HEIGHT = 600;

function renderSocialMediaTypeBarChart(svgId) {

    d3.csv("data/us_aggregated_pivoted.csv").then(d => chart(d));

    function chart(csv) {

        csv.forEach(function (d) {
            d.Value = +d.Value;
            return d;
        })
        var months = [...new Set(csv.map(d => d.Month))],
            state = [...new Set(csv.map(d => d.state))];


        var options = d3.select("#year").selectAll("option")
            .data(months)
            .enter().append("option")
            .text(d => d);

        const yAxisLabel = 'Counts';
        const xAxisLabel = 'Type';

        var svg = d3.select(svgId)
                .append("svg")
                .attr("width", WIDTH)
                .attr("height", HEIGHT),
            margin = {top: 25, bottom: 15, left: 72, right: 25},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;


        var x = d3.scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1)
            .paddingOuter(0.2)

        var y = d3.scaleLinear()
            .range([height - margin.bottom, margin.top])

        var xAxis = g => g
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));

        var yAxis = g => g
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y).tickFormat(d3.format("~s")))


        svg.append("g")
            .attr("class", "x-axis")

        svg.append("g")
            .attr("class", "y-axis")

        update(d3.select("#year").property("value"), 2000)

        function update(Month, speed) {

            var data = csv.filter(f => f.Month === Month);
            let recoveredPercentage;
            let deathsPercentage;

            if (Month === "All") {

                innerdata = d3.nest()
                    .key(function (d) {
                        return d.Type;
                    })
                    .rollup(function (d) {
                        return d3.max(d, function (g) {
                            return g.Value;
                        });
                    }).entries(csv);


                recoveredPercentage = ((innerdata[1].value / innerdata[0].value) * 100).toFixed(2);
                deathsPercentage = ((innerdata[2].value / innerdata[0].value) * 100).toFixed(2);


                innerdata.forEach(d => {
                    const monthData = {Date: "2020-03-31", Month: "All", Type: d.key, Value: d.value};
                    data.push(monthData);
                });
            } else {
                recoveredPercentage = ((data[1].Value / data[0].Value) * 100).toFixed(2);
                deathsPercentage = ((data[2].Value / data[0].Value) * 100).toFixed(2);

            }


            y.domain(d3.extent(data, d => d.Value)).nice();

            svg.selectAll(".y-axis").transition().duration(speed)
                .call(yAxis);

            svg.selectAll(".y-axis").call(yAxis)
                .append('text')
                .attr('class', 'axis-label')
                .attr('y', -50)
                .attr('x', -height / 2)
                .attr('fill', 'black')
                .attr('transform', `rotate(-90)`)
                .attr('text-anchor', 'middle')
                .text(yAxisLabel);


            x.domain(data.map(d => d.Type))

            svg.selectAll(".x-axis").transition().duration(speed)
                .call(xAxis);

            svg.selectAll(".x-axis").call(xAxis)
                .append('text')
                .attr('class', 'axis-label')
                .attr('y', 50)
                .attr('x', width / 2)
                .attr('fill', 'black')
                .text(xAxisLabel);


            function getpercentage(colum) {
                if (colum.Type === 'Recovered') {
                    return recoveredPercentage + '% of Confirmed Cases';
                } else if (colum.Type === 'Deaths') {
                    return deathsPercentage + '% of Confirmed Cases';
                } else {
                    return ((colum.Value / 329997655) * 100).toFixed(2) + '% of US Population';
                }
            }

            var tooltip = d3.select(svgId).append("div")
                .attr("class", "tooltipcharts")
                .style("opacity", 0);

            // tooltip mouseover event handler
            var tipMouseover = function (d) {
                var html ="<span style='margin-left: 2.5px;'><h8>Month: <b style='color:lightblue'>" + d.Month + "</b></h8></span><br>";
                html += "<span style='margin-left: 2.5px;'><h8>Type: <b style='color:lightblue'>" + d.Type + "</b></h8></span><br>";
                html += "<span style='margin-left: 2.5px;'><h8>Counts: <b style='color:lightblue'>" + d.Value + "</b></h8></span><br>";
                html += "<span style='margin-left: 2.5px;'><h8>Percentage: <b style='color:lightblue'>" + getpercentage(d) + "</b></h8></span><br>";

                tooltip.html(html)
                    .style("left", d3.event.pageX  + "px")
                    .style("top", d3.event.pageY + "px")
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

            var bar = svg.selectAll(".bar")
                .data(data, d => d.Type)

            bar.exit().remove();



            // Add annotation to the chart
            if (Month === "All") {

                bar.enter().append("rect")
                    .on('mouseover', tipMouseover)
                    .on('mouseout', tipMouseout)
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .merge(bar)
                    .attr("y", d => height-margin.bottom)
                    .attr("x", d => x(d.Type))
                    .attr("height", 0)
                    .transition().duration(speed)
                    .attr("y", d => y(d.Value))
                    .attr("height", d => y(0) - y(d.Value));

                svg.append("g")
                    .html("<g class=\"annotation-01\"><g class=\"annotations\"><g class=\"annotation callout  \" " +
                        "transform=\"translate(232, 490)\"><g class=\"annotation-connector\"><path class=\"connector\" " +
                        "d=\"M0,0L200,-150\" stroke=\"red\" fill=\"none\" style=\"stroke-dasharray: 3, 3;\"></path><path" +
                        " class=\"connector-end connector-dot\" d=\"M5.19573633741296e-16," +
                        "-8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,-5.19573633741296e-16," +
                        "8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,5.19573633741296e-16," +
                        "-8.485281374238571Z\" transform=\"translate(0, 0)\" fill=\"red\" stroke=\"red\"></path>" +
                        "</g><g class=\"annotation-subject\"></g><g class=\"annotation-note\" transform=\"translate(200," +
                        " -150)\"><g class=\"annotation-note-content\" transform=\"translate(0, -80.2890625)\">" +
                        "<rect class=\"annotation-note-bg\" width=\"112.078125\" height=\"77.2890625\" x=\"0\" y=\"0\"" +
                        " fill=\"white\" fill-opacity=\"0\"></rect><text class=\"annotation-note-label\" dx=\"0\" " +
                        "y=\"20.3671875\" fill=\"red\"><tspan x=\"0\" dy=\"0.8em\">Has highest</tspan><tspan x=\"0\" " +
                        "dy=\"1.2em\">number of</tspan><tspan x=\"0\" dy=\"1.2em\">Cases: 405,931</tspan></text><text " +
                        "class=\"annotation-note-title\" fill=\"red\" font-weight=\"bold\"><tspan x=\"0\" " +
                        "dy=\"0.8em\">New York</tspan></text></g><path class=\"note-line\" d=\"M0,0L112.078125,0\" " +
                        "stroke=\"red\"></path></g></g></g></g>");


            } else {
                bar.enter().append("rect")
                    .on('mouseover', tipMouseover)
                    .on('mouseout', tipMouseout)
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .merge(bar)
                    .transition().duration(speed)
                    .attr("x", d => x(d.Type))
                    .attr("y", d => y(d.Value))
                    .attr("height", d => y(0) - y(d.Value));

                var annotation = svg.selectAll(".annotation-01")
                annotation.remove();
            }

        }

        chart.update = update;

    }

    var select = d3.select("#year")
        .style("border-radius", "5px")
        .on("change", function () {
            chart.update(this.value, 800)
        })
}

renderSocialMediaTypeBarChart('#corona-in-us-barchart');