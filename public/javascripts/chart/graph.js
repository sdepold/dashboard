Dashboard.Chart.Graph = function(chart, values) {
  if(!chart) throw new Error('No chart passed!')

  this.chart = chart
  this.paper = this.chart.paper
  this.path = null
  this.highlights = []
  this.values = values
}

Dashboard.Chart.Graph.prototype.__defineGetter__('height', function() {
  return this.paper.height
})

Dashboard.Chart.Graph.prototype.__defineGetter__('width', function() {
  return this.paper.width
})

Dashboard.Chart.Graph.prototype.__defineGetter__('valueConversionOptions', function() {
  return {
    width: this.paper.width,
    height: this.paper.height,
    values: this.values,
    max: this.chart.maxValue
  }
})

Dashboard.Chart.Graph.prototype.render = function(options) {
  this.options = jQuery.extend({
    rgb: { red: 200, green: 0, blue: 0 }
  }, options || {})

  var self  = this
    , path = this._generatePathString()
    , strokeColor = Dashboard.Chart.Helpers.rgb(this.options)
    , fillColor = Dashboard.Chart.Helpers.rgb(this.options.rgb)
    , graph = null

  graph = this
    .paper
    .path(path)
    .attr({stroke: 'rgba(' + fillColor + ',1)', fill: 'rgba(' + fillColor + ',0.6)', 'stroke-width': 2})

  return this
}

Dashboard.Chart.Graph.prototype.highlight = function(e) {
  var mouseX   = e.offsetX
    , mouseY   = e.offsetY
    , segment  = null
    , linePath = null
    , rgb      = Dashboard.Chart.Helpers.rgb(this.options.rgb)
    , attrs    = { stroke: 'rgba(' + rgb + ',1)', 'stroke-width': 2 }

  segment = this._generatePathString(this.values).split('L').reduce(function(prev, seg) {
    var x = parseFloat(seg.split(',')[0])
      , y = parseFloat(seg.split(',')[1])

    if((!prev.x && !prev.y) &&(x >= mouseX) && (x > prev.x))
      return {x: x, y: y}
    else
      return prev
  }, {x: 0, y: 0})

  linePath = 'M%{x},%{y}L%{x},%{height}'
  linePath = linePath.replace(new RegExp('%{x}', 'g'), segment.x)
  linePath = linePath.replace('%{height}', this.options.height)
  linePath = linePath.replace('%{y}', segment.y)

  var line        = this.paper.path(linePath).attr(attrs)
    , circleAttrs = jQuery.extend(attrs, { fill: 'rgba(' + rgb + ',1)' })
    , circle      = this.paper.circle(segment.x, segment.y, 6).attr(circleAttrs)
    , yAbsolute   = Dashboard.Chart.Helpers.valueToAbsolute(segment.y, jQuery.extend(this.options, this.valueConversionOptions))
    , labelAttrs  = { 'font-weight': 'bold', 'fill': 'rgba(' + Dashboard.Chart.Helpers.rgb(this.options.rgb, 50) + ',1)' }
    , label       = this.paper.text(segment.x + 5, this.options.height - 25, yAbsolute).attr(labelAttrs)
    , labelWidth  = label.getBBox().width
    , labelX      = segment.x + (labelWidth / 2) + 5

  if (labelX + labelWidth > this.options.width)
    labelX = segment.x - (labelWidth / 2) - 5

  label.attr('x', labelX)

  this.highlights.forEach(function(highlight) { highlight.remove() })
  this.highlights.push(line)
  this.highlights.push(circle)
  this.highlights.push(label)
}

Dashboard.Chart.Graph.prototype.unhighlight = function() {
  this.highlights.forEach(function(e){ e.remove() })
}

// private

Dashboard.Chart.Graph.prototype._generatePathString = function() {
  var path = 'M0,%{height}L%{valuePath}L%{width},%{height}Z'
    , self = this

  var valuePath = this.values.map(function(value, i) {
    var x = Dashboard.Chart.Helpers.valueToRelative(i, jQuery.extend({ lengthwise: true }, self.valueConversionOptions))
      , y = Dashboard.Chart.Helpers.valueToRelative(value, self.valueConversionOptions)

    return [x, y].join(',')
  }).join('L')

  path = path
    .replace(new RegExp('%{height}', 'g'), this.paper.height)
    .replace(new RegExp('%{width}', 'g'), this.paper.width)
    .replace(new RegExp('%{valuePath}', 'g'), valuePath)

  return path
}
