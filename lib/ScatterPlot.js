var WIDTH = 1000, HEIGHT = 600;

function rendertScatterPlot(svgId) {
    const svg = d3.select(svgId)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const render = data => {
        const title = 'Total confirmed Cases due to COVID-19 vs. Population, Jul 16, 2020';

        const xValue = d => d.Total_Population;
        const xAxisLabel = 'Population';

        const yValue = d => d.Confirmed;
        const circleRadius = 10;
        const yAxisLabel = 'Confirmed Cases';

        const margin = {top: 60, right: 40, bottom: 88, left: 150};
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        var ticksx = [100000, 1000000, 10000000, 100000000, 500000000, 1400000000];
        var ticksy = [10, 100, 1000, 10000, 100000, 1000000, 4000000];


        const xScale = d3.scaleLog()
            .domain(d3.extent(data, xValue))
            .range([0, innerWidth])
            .nice();

        const yScale = d3.scaleLog()
            .domain([1, d3.max(data, yValue)])
            .range([innerHeight, 0])
            .nice();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xAxisTickFormat = number =>
            d3.format('~s')(number)
                .replace('G', 'B');

        const xAxis = d3.axisBottom(xScale)
            .tickValues(ticksx)
            .tickFormat(xAxisTickFormat)
            .tickSize(5)
            .tickPadding(15);

        const yAxis = d3.axisLeft(yScale)
            .tickValues(ticksy)
            .tickFormat(d3.format("~s"))
            .tickSize(5)
            .tickPadding(10);

        const yAxisG = g.append('g').call(yAxis);
        // yAxisG.selectAll('.domain').remove();

        yAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', -50)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabel);

        const xAxisG = g.append('g').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);

        // xAxisG.select('.domain').remove();

        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 50)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);

        // Define our scales
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);


        // Add the tooltip container to the vis container
        // it's invisible and its position/contents are defined during mouseover
        var tooltip = d3.select(svgId).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // tooltip mouseover event handler
        var tipMouseover = function (d) {
            var color = colorScale(d.Confirmed);
            var html =
                "<b><span style='color:" + color + ";'>Country: " + d.Country + "</span></b><br/>" +
                "<b>" + "Confirmed: " + d.Confirmed + "</b>  <br/>" +
                "<b>" + "Recovered: " + d.Recovered + "</b>  <br/>" +
                "<b>" + "Deaths: " + d.Deaths + "</b> <br/>" +
                "<b>" + "Population: " + d.Total_Population + "</b> ";

            tooltip.html(html)
                .style("left", d3.event.pageX - 350 + "px")
                .style("top", d3.event.pageY - 150 + "px")
                .transition()
                .duration(200) // ms
                .style("opacity", .9) // started as 0!

        };
        // tooltip mouseout event handler
        var tipMouseout = function (d) {
            tooltip.transition()
                .duration(300) // ms
                .style("opacity", 0);
        };


        g.selectAll('circle').data(data)
            .enter().append('circle')
            .on("mouseover", tipMouseover)
            .on("mouseout", tipMouseout)
            .attr('cy', d => yScale(1))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .style("fill", d => colorScale(d.Confirmed))
            .style("opacity", d => 0)
            .transition().duration(3000).delay(500)
            .style("opacity", d => 0.3)
            .attr('cy', d => yScale(yValue(d)));


        g.append('text')
            .attr('class', 'title')
            .attr('x', 70)
            .attr('y', -15)
            .text(title);
    };

    d3.csv('data/countries-total.csv')
        .then(data => {
            data.forEach(d => {
                d.Confirmed = +d.Confirmed;
                d.Deaths = +d.Deaths;
                d.Recovered = +d.Recovered;
                d.Total_Population = +d.Total_Population;
            });
            render(data);
        });

}


rendertScatterPlot('#world-scatter-plot');