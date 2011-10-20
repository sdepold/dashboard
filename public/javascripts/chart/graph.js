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

Dashboard.Chart.Graph.prototype.__defineGetter__('fillColor', function() {
  var rgb = Dashboard.Chart.Helpers.rgb(this.options.rgb)
  return 'rgba(' + rgb + ',0.6)'
})

Dashboard.Chart.Graph.prototype.__defineGetter__('strokeColor', function() {
  var rgb = Dashboard.Chart.Helpers.rgb(this.options.rgb)
  return 'rgba(' + rgb + ',1)'
})

Dashboard.Chart.Graph.prototype.render = function(options) {
  this.options = jQuery.extend({
    rgb: { red: 200, green: 0, blue: 0 }
  }, options || {})

  var self  = this
    , path = this._generatePathString()
    , graph = null

  graph = this
    .paper
    .path(path)
    .attr({stroke: this.strokeColor, fill: this.fillColor, 'stroke-width': 2})

  return this
}

Dashboard.Chart.Graph.prototype.highlight = function(e, yOffset) {
  var segment = this._getHighlightedSegment(e.offsetX)
    , attrs   = { stroke: this.strokeColor, 'stroke-width': 2 }
    , label   = this._renderHighlightLabel(segment, attrs)

  this.unhighlight()
  this.highlights.push(this._renderHighlightLine(segment, attrs))
  this.highlights.push(this._renderHighlightCircle(segment, attrs))
  this.highlights.push(label)
  this.highlights.push(this._renderHighlightLabelContainer(label))
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

Dashboard.Chart.Graph.prototype._getHighlightLinePath = function(x, y, h) {
  return 'M%{x},%{y}L%{x},%{height}Z'
    .replace(new RegExp('%{x}', 'g'), x)
    .replace('%{height}', h)
    .replace('%{y}', y)
}

Dashboard.Chart.Graph.prototype._getHighlightedSegment = function(mouseX) {
  return this._generatePathString(this.values).split('L').reduce(function(prev, seg) {
    var x = parseFloat(seg.split(',')[0])
      , y = parseFloat(seg.split(',')[1])

    if((!prev.x && !prev.y) &&(x >= mouseX) && (x > prev.x))
      return {x: x, y: y}
    else
      return prev
  }, {x: 0, y: 0})
}

Dashboard.Chart.Graph.prototype._renderHighlightCircle = function(segment, attrs) {
  var circleAttrs = jQuery.extend(attrs, { fill: this.strokeColor })
    , circle      = this.paper.circle(segment.x, segment.y, 3).attr(circleAttrs)

  return circle
}

Dashboard.Chart.Graph.prototype._renderHighlightLine = function(segment, attrs) {
  var linePath = this._getHighlightLinePath(segment.x, segment.y, this.options.height)
    , line     = this.paper.path(linePath).attr(attrs)

  return line
}

Dashboard.Chart.Graph.prototype._renderHighlightLabel = function(segment, attrs) {
  var yAbsolute   = Dashboard.Chart.Helpers.valueToAbsolute(segment.y, jQuery.extend(this.options, this.valueConversionOptions))
    , labelAttrs  = { 'font-weight': 'bold', 'fill': "white" }
    , label       = this.paper.text(0, segment.y, Dashboard.Chart.Helpers.limitDecimals(yAbsolute)).attr(labelAttrs)
    , labelWidth  = label.getBBox().width
    , labelX      = segment.x + (labelWidth / 2) + 10

  if (labelX + labelWidth > this.options.width)
    labelX = segment.x - (labelWidth / 2) - 10

  return label.attr('x', labelX)
}

Dashboard.Chart.Graph.prototype._renderHighlightLabelContainer = function(label) {
  var bBox    = label.getBBox()
    , padding = 2
    , attrs   = {stroke: this.strokeColor, fill: this.fillColor, 'stroke-width': 2}
    , rect    = this.paper.rect(bBox.x - padding, bBox.y - padding, bBox.width + 2*padding, bBox.height + 2*padding).attr(attrs)

  label.toFront()

  return rect
}
