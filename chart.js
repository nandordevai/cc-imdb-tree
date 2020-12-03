let maxGrossUSD = null;
let maxRating = null;
let ratingScale = null;

function sortTitle(a, b) {
    if (a.title_eng > b.title_eng) {
        return 1;
    } else if (a.title_eng < b.title_eng) {
        return -1
    } else {
        return 0;
    }
}

d3.json('./top-1000-extended-posters.json')
    .then((data) => {
        const slice = data.filter(_ => _.year >= 2017 && _.metascore !== '');
        maxGrossUSD = d3.max(slice.map(_ => _.gross_usd));
        maxRating = d3.max(slice.map(_ => _.metascore));
        ratingScale = d3.scaleLinear([0, maxRating], [1, 25]);
        const movies = d3.nest()
            .key(d => d.year).sortKeys(d3.descending)
            .key(d => d.genre.split(', ')[0]).sortKeys(d3.ascending)
            .sortValues(sortTitle)
            .entries(slice);
        const root = d3.hierarchy(
            {
                key: 'IMDB Top',
                values: movies,
            },
            d => d.values);
        const treeLayout = d3.tree();
        treeLayout.size([1500, 800]);
        treeLayout(root);
        draw(root);
    });

function nodeSize(d) {
    return d.data.metascore ? ratingScale(d.data.metascore) : 10;
}

function draw(root) {
    // Nodes
    const movies = d3.select('svg g.nodes')
        .selectAll('g')
        .data(root.descendants())
        .join(enter => enter.append('g'));

    movies.append('circle')
        .classed('node', true)
        .classed('leaf', d => d.data.metascore)
        .attr('cx', d => d.y)
        .attr('cy', d => d.x)
        .attr('r', d => nodeSize(d));

    movies.append('text')
        .text(d => d.data.title_eng || d.data.key)
        .attr('x', d => d.data.title_eng ? d.y + 30 : d.y - 20)
        .attr('y', d => d.x)
        .classed('title', d => d.data.title_eng)

    // Links
    const link = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);

    const grossScale = d3.scaleLinear([0, maxGrossUSD], [1, 30]);
    const linkColors = d3.scaleOrdinal([], ['#ccc', '#aaa', '#888']);

    d3.select('svg g.links')
        .selectAll('path.link')
        .data(root.links())
        .join(enter => enter.append('path')
            .classed('link', true)
            .attr('d', link)
            .attr('stroke', '#000')
            .attr('stroke-width', d => `${grossScale(d.target.data.gross_usd)}px`)
            .attr('stroke', (_, i) => linkColors(i)));
}