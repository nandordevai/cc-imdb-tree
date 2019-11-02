d3.json('./top-1000-extended-posters.json')
    .then(function(data) {
        const slice = data.filter(function(_) { return _.year >= 2017 && _.metascore !== ''; });
        const movies = d3.nest()
            .key(function(d) { return d.year; }).sortKeys(d3.descending)
            .key(function(d) { return d.genre.split(', ')[0]; }).sortKeys(d3.ascending)
            .entries(slice);
        const root = d3.hierarchy(
            {
                title_eng: 'IMDB Top',
                values: movies,
            },
            function(d) { return d.values; });
        const treeLayout = d3.tree();
        treeLayout.size([1500, 800]);
        treeLayout(root);
        draw(root);
    });

function draw(root) {
    // Nodes
    const movies = d3.select('svg g.nodes')
        .selectAll('g')
        .data(root.descendants())
        .join(
            function(enter) { return enter.append('g'); }
        );

    movies.append('circle')
        .attr('cx', function(d) { return d.y; })
        .attr('cy', function(d) { return d.x; })
        .attr('r', 10);

    // Links
    const link = d3.linkHorizontal()
        .x(function(d) { return d.y; })
        .y(function(d) { return d.x; });

    d3.select('svg g.links')
        .selectAll('path.link')
        .data(root.links())
        .join(
            function(enter) {
                return enter.append('path')
                    .classed('link', true)
                    .attr('d', link)
                    .attr('stroke', '#000');
            }
        );
}