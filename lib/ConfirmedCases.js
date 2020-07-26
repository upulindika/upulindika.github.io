var WIDTH = 1000, HEIGHT = 600;

function renderProductBarChart(svgId) {
    d3.csv("data/us-states.csv").then(d => chart(d));

    function chart(csv) {

        csv.forEach(function (d) {
            var dates = d.date.split("-");
            d.month = dates[1];
            d.cases = +d.cases;
            return d;
        })

        var months = [...new Set(csv.map(d => d.month))],
            state = [...new Set(csv.map(d => d.state))];

        var options = d3.select("#year").selectAll("option")
            .data(state)
            .enter().append("option")
            .text(d => d);

        const yAxisLabel = 'Confirmed Cases';
        const xAxisLabel = 'Month';

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
            .call(d3.axisBottom(x).tickFormat(function (date) {
                if (d3.timeMonth(date) < date) {
                    return d3.timeFormat("%B")(new Date(2020, date - 1, 1));
                } else {
                    return d3.timeFormat('%Y')(date);
                }
            }).tickSizeOuter(0));

        var yAxis = g => g
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y).tickFormat(d3.format("~s")))


        svg.append("g")
            .attr("class", "x-axis")

        svg.append("g")
            .attr("class", "y-axis")

        update(d3.select("#year").property("value"), 2000)

        function update(state, speed) {
            var data = csv.filter(f => f.state === state);

            if (state === "All") {

                innerdata = d3.nest()
                    .key(function (d) {
                        return d.month;
                    })
                    .rollup(function (d) {
                        return d3.sum(d, function (g) {
                            return g.cases;
                        });
                    }).entries(csv);
                innerdata.forEach(d => {
                    const monthData = {date: "2020-07-20", state: "All", cases: d.value, deaths: "0", month: d.key};
                    data.push(monthData);
                });

            }

            y.domain(d3.extent(data, d => d.cases)).nice();

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

            x.domain(data.map(d => d.month))

            svg.selectAll(".x-axis").transition().duration(speed)
                .call(xAxis);

            svg.selectAll(".x-axis").call(xAxis)
                .append('text')
                .attr('class', 'axis-label')
                .attr('y', 50)
                .attr('x', width / 2)
                .attr('fill', 'black')
                .text(xAxisLabel);

            var tooltip = d3.select(svgId).append("div")
                .attr("class", "tooltipcharts")
                .style("opacity", 0);
            // tooltip mouseover event handler
            var tipMouseover = function (d) {
                var html ="<span style='margin-left: 2.5px;'><h8>Month: <b style='color:lightblue'>" + d3.timeFormat("%B")(new Date(2020, d.month - 1, 1)) + "</b></h8></span><br>";
                html += "<span style='margin-left: 2.5px;'><h8>State: <b style='color:lightblue'>" + d.state + "</b></h8></span><br>";
                html += "<span style='margin-left: 2.5px;'><h8>Total Cases: <b style='color:lightblue'>" + d.cases + "</b></h8></span><br>";;

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
                .data(data, d => d.month)

            bar.exit().remove();


            // Add annotation to the chart
            if (state === "All") {

                bar.enter().append("rect")
                    .on('mouseover', tipMouseover)
                    .on('mouseout', tipMouseout)
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .merge(bar)
                    .attr("y", d => height - margin.bottom)
                    .attr("x", d => x(d.month))
                    .attr("height", 0)
                    .transition().duration(speed).delay(200)

                    .attr("y", d => y(d.cases))
                    .attr("height", d => y(0) - y(d.cases));

                svg.append("g")
                    .html("<g class=\"annotation-01\"><g class=\"annotations\"><g class=\"annotation callout  \" " +
                        "transform=\"translate(808, 155)\"><g class=\"annotation-connector\"><path class=\"connector\"" +
                        " d=\"M0,0L-70,-10\" stroke=\"red\" fill=\"none\" style=\"stroke-dasharray: 3, 3;\"></path>" +
                        "<path class=\"connector-end connector-dot\" d=\"M5.19573633741296e-16," +
                        "-8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,-5.19573633741296e-16," +
                        "8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,5.19573633741296e-16," +
                        "-8.485281374238571Z\" transform=\"translate(0, 0)\" fill=\"red\" stroke=\"red\">" +
                        "</path></g><g class=\"annotation-subject\"></g><g class=\"annotation-note\" " +
                        "transform=\"translate(-70, -10)\"><g class=\"annotation-note-content\"" +
                        " transform=\"translate(-115.59375, -41.8828125)\"><rect class=\"annotation-note-bg\" " +
                        "width=\"115.59375\" height=\"38.8828125\" x=\"0\" y=\"0\" fill=\"white\" fill-opacity=\"0\">" +
                        "</rect><text class=\"annotation-note-label\" dx=\"0\" y=\"20.3671875\" fill=\"red\">" +
                        "<tspan x=\"0\" dy=\"0.8em\">on July 8</tspan></text><text class=\"annotation-note-title\" " +
                        "fill=\"red\" font-weight=\"bold\"><tspan x=\"0\" dy=\"0.8em\">3 Million Cases</tspan></text>" +
                        "</g><path class=\"note-line\" d=\"M-115.59375,0L0,0\" stroke=\"red\"></path></g></g>" +
                        "<g class=\"annotation callout  \" transform=\"translate(808, 490)\">" +
                        "<g class=\"annotation-connector\"><path class=\"connector\" d=\"M0,0L70,-10\" " +
                        "stroke=\"red\" fill=\"none\" style=\"stroke-dasharray: 3, 3;\"></path><path " +
                        "class=\"connector-end connector-dot\" d=\"M5.19573633741296e-16," +
                        "-8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,-5.19573633741296e-16," +
                        "8.485281374238571A8.485281374238571,8.485281374238571,0,1,1,5.19573633741296e-16," +
                        "-8.485281374238571Z\" transform=\"translate(0, 0)\" fill=\"red\" stroke=\"red\">" +
                        "</path></g><g class=\"annotation-subject\"></g><g class=\"annotation-note\" " +
                        "transform=\"translate(70, -10)\"><g class=\"annotation-note-content\" " +
                        "transform=\"translate(0, -80.2890625)\"><rect class=\"annotation-note-bg\" " +
                        "width=\"112.078125\" height=\"77.2890625\" x=\"0\" y=\"0\" fill=\"white\" " +
                        "fill-opacity=\"0\"></rect><text class=\"annotation-note-label\" dx=\"0\"" +
                        " y=\"20.3671875\" fill=\"red\"><tspan x=\"0\" dy=\"0.8em\">Has highest</tspan>" +
                        "<tspan x=\"0\" dy=\"1.2em\">number of</tspan><tspan x=\"0\" dy=\"1.2em\">Cases: 405,931" +
                        "</tspan></text><text class=\"annotation-note-title\" fill=\"red\" font-weight=\"bold\">" +
                        "<tspan x=\"0\" dy=\"0.8em\">New York</tspan></text></g><path class=\"note-line\" " +
                        "d=\"M0,0L112.078125,0\" stroke=\"red\"></path></g></g></g></g>");



            } else {
                bar.enter().append("rect")
                    .on('mouseover', tipMouseover)
                    .on('mouseout', tipMouseout)
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .merge(bar)
                    .transition().duration(speed)
                    .attr("x", d => x(d.month))
                    .attr("y", d => y(d.cases))
                    .attr("height", d => y(0) - y(d.cases));


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

renderProductBarChart('#confirmed-cases-bar-chart');