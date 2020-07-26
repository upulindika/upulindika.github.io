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


            // data.sort(d3.select("#sort").property("checked")
            //     ? (a, b) => b.cases - a.cases
            //     : (a, b) => months.indexOf(a.month) - months.indexOf(b.month))

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


            // Create Tooltips
            var tip = d3.tip().attr('class', 'd3-tip')
                .html(function (d) {
                    var content = "<span style='margin-left: 2.5px;'><h8>Month: <b style='color:lightblue'>" + d3.timeFormat("%B")(new Date(2020, d.month - 1, 1)) + "</b></h8></span><br>";
                    content += "<span style='margin-left: 2.5px;'><h8>State: <b style='color:lightblue'>" + d.state + "</b></h8></span><br>";
                    content += "<span style='margin-left: 2.5px;'><h8>Total Cases: <b style='color:lightblue'>" + d.cases + "</b></h8></span><br>";

                    return content;
                });


            svg.call(tip);
            var bar = svg.selectAll(".bar")
                .data(data, d => d.month)

            bar.exit().remove();





            // Add annotation to the chart
            if (state === "All") {

                bar.enter().append("rect")
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .merge(bar)
                    .attr("y", d => height-margin.bottom)
                    .attr("x", d => x(d.month))
                    .attr("height", 0)
                    .transition().duration(speed).delay(200)

                    .attr("y", d => y(d.cases))
                    .attr("height", d => y(0) - y(d.cases));



                const annotations = [
                    {
                        note: {
                            label: "on July 8",
                            title: "3 Million Cases"
                        },
                        connector: {
                            end: "dot",        // Can be none, or arrow or dot
                            type: "line",// ?? don't know what it does
                            lineType: "vertical",    // ?? don't know what it does
                            endScale: 8
                        },

                        color: ["red"],
                        x: 808,
                        y: 155,
                        dy: -10,
                        dx: -70
                    },
                    {
                        note: {
                            label: "Has highest number of Cases: 405,931",
                            title: "New York"
                        },
                        connector: {
                            end: "dot",        // Can be none, or arrow or dot
                            type: "line",// ?? don't know what it does
                            lineType: "vertical",    // ?? don't know what it does
                            endScale: 8
                        },

                        color: ["red"],
                        x: 808,
                        y: 490,
                        dy: -10,
                        dx: 70
                    }
                ];

                // Add annotation to the chart
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


            } else {
                bar.enter().append("rect")
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
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