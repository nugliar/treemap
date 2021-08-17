import * as d3 from "https://cdn.skypack.dev/d3@7";

document.addEventListener('DOMContentLoaded', () => {
  const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  const gameSalesData = fetch(url)
    .then(response => response.json())
    .then(data => {

      const fontSize = 14
      const color = d3.scaleOrdinal(d3.schemeCategory10)

      const w = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth

      const h = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight

      const legendWidth = w * 0.5
      const legendHeight = h * 0.2

      const tooltip = d3.select('.inner-container')
        .append('div')
        .attr('id', 'tooltip')
        .attr('class', 'tooltip')
        .style('display', 'none')

      const svg = d3.create('svg')
        .attr('viewBox', [0, 0, w, h + legendHeight])
        .attr('width', '80%')
        .style('font-family', 'monospace')
        .style('font-size', fontSize + 'px')

      const root = d3.treemap()
        .size([w, h])
        .paddingInner(1)
        .round(true)
        (d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.height - a.height || b.value - a.value))

      const leaves = svg.selectAll('g')
        .data(root.leaves())
        .join('g')
          .attr('transform', d => `translate(${d.x0}, ${d.y0})`)

      leaves.append('rect')
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => {
          while(d.depth > 1) { d = d.parent }
          return color(d.data.name)
        })
        .style('fill-opacity', 0.6)
        .on('mouseover', (e, d) => {
          const data = d.data

          tooltip.transition()
            .duration(0)
            .style('display', 'block')

          tooltip.html(
            `Name: ${data.name}<br>
            Category: ${data.category}<br>
            Value: ${data.value}`
          )
            .attr('data-value', data.value)
            .style("left", (e.pageX + 5) + "px")
            .style("top", (e.pageY - 30) + "px")
            .style('text-align', 'center')
        })
        .on('mouseout', e => {
          tooltip.transition()
            .duration(0)
            .style('display', 'none')
        })

      leaves.append('text')
        .selectAll('tspan')
        .data(d => {
          const words = d.data.name.split(/[ \/]/)

          let lines = []
          let lineLength = 0
          let lineLimit = (d.x1 - d.x0) / (fontSize * 0.7)

          words.forEach(word => {
            if (word.length + lineLength <= lineLimit) {
              lines.push((lines.pop() || '').concat(` ${word}`))
              lineLength += word.length
            } else {
              lines.push(word.length > lineLimit ?
                word.substring(0, lineLimit - 1) + '...' :
                word
              )
              lineLength = word.length
            }
          })

          return lines.slice(0, (d.y1 - d.y0) / fontSize)
        })
        .join('tspan')
          .attr('x', 5)
          .attr('y', (d, i) => `${1 + i * 1}em`)
          .text(d => d)

      d3.select('.inner-container')
        .append(() => svg.node())

      const categories = root.children.map(d => d.data.name)

      const nRows = 6
      const nCols = Math.round(categories.length / nRows)
      const paddingY = 15
      const heightLegendElem = (legendHeight - paddingY) / nRows
      const widthLegendElem = legendWidth / nCols

      const rectX = i => parseInt(i / 6) * widthLegendElem
      const rectY = i => (i % 6) * heightLegendElem + paddingY

      const legendG = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${(w - legendWidth) / 2}, ${h})`)

      const categoryG = legendG.selectAll('g')
        .data(categories)
        .join('g')
          .attr('transform', (d, i) => `translate(${rectX(i)}, ${rectY(i)})`)

      categoryG.append('rect')
        .attr('class', 'legend-item')
        .attr('width', widthLegendElem * 0.1)
        .attr('height', heightLegendElem * 0.7)
        .attr('fill', d => color(d))

      categoryG.append('text')
        .attr('x', widthLegendElem * 0.15)
        .attr('y', heightLegendElem * 0.5)
        .attr('fill', '#222')
        .text(d => d)
    })
    .catch(e => console.error(e.message))
})
