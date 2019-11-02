var maxGrossUSD = null;
var maxRating = null;

d3.json('./top-1000-extended-posters.json')
    .then(function (data) {
        var slice = data.filter(function (_) { return _.year >= 2017 && _.metascore !== ''; });
        maxGrossUSD = d3.max(slice.map(function(_) { return _.gross_usd; }));
        maxRating = d3.max(slice.map(function(_) { return _.metascore; }));
        var movies = d3.nest()
            .key(function (d) { return d.year; }).sortKeys(d3.descending)
            .key(function (d) { return d.genre.split(', ')[0]; }).sortKeys(d3.ascending)
            .sortValues((a, b) => {
                if (a.title_eng > b.title_eng) {
                    return 1;
                } else if (a.title_eng < b.title_eng) {
                    return -1
                } else {
                    return 0;
                }
            })
            .entries(slice);
        var root = d3.hierarchy(
            {
                title_eng: 'IMDB Top',
                values: movies,
            },
            function (d) { return d.values; });
        var treeLayout = d3.tree();
        treeLayout.size([1500, 800]);
        treeLayout(root);
        draw(root);
    });

function nodeSize(d) {
    var ratingScale = d3.scaleLinear([0, maxRating], [1, 25]);
    return d.data.metascore ? ratingScale(d.data.metascore) : 10;
}

function draw(root) {
    // Nodes
    var movies = d3.select('svg g.nodes')
        .selectAll('g')
        .data(root.descendants())
        .join(
            function (enter) { return enter.append('g'); }
        );

    movies.append('circle')
        .classed('node', true)
        .classed('leaf', function (d) { return d.data.metascore; })
        .attr('cx', function (d) { return d.y; })
        .attr('cy', function (d) { return d.x; })
        .attr('r', function (d) { return nodeSize(d); });

    movies.append('text')
        .text(function (d) { return d.data.title_eng || d.data.key; })
        .attr('x', function (d) { return d.data.title_eng ? d.y + 30 : d.y - 20; })
        .attr('y', function (d) { return d.x; })
        .classed('title', function (d) { return d.data.title_eng; })

    // Links
    var link = d3.linkHorizontal()
        .x(function (d) { return d.y; })
        .y(function (d) { return d.x; });

    var grossScale = d3.scaleLinear([0, maxGrossUSD], [1, 30]);
    var linkColors = d3.scaleOrdinal([], ['#ccc', '#aaa', '#888']);

    d3.select('svg g.links')
        .selectAll('path.link')
        .data(root.links())
        .join(
            function (enter) {
                return enter.append('path')
                    .classed('link', true)
                    .attr('d', link)
                    .attr('stroke', '#000')
                    .attr('stroke-width', function (d) {
                        return `${grossScale(d.target.data.gross_usd)}px`;
                    })
                    .attr('stroke', function (d, i) { return linkColors(i); });
                }
        );
}