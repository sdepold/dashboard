Dashboard.Chart = function(options) {
  this.options = $.extend({
    width: 640,
    height: 480,
    domElement: null,
    rgb: {
      red: 200,
      green: 0,
      blue: 0
    }
  }, options || {})

  this.paper = new Raphael(
    this.options.domElement,
    this.options.width,
    this.options.height
  )

  this.path = null
  this.highlights = []
}

Dashboard.Chart.prototype.render = function(values) {
  var path  = this._generatePathString(this.values = values)
    , self  = this

  this.path = this
    .paper
    .path(path)
    .attr({stroke: 'rgba(' + this._rgb() + ',1)', fill: 'rgba(' + this._rgb() + ',0.6)', 'stroke-width': 2})
    .mousemove(function(e) {
      self._highlightValue(e)
    })

  this._drawAxisLabels(7)
}

// private

Dashboard.Chart.prototype._rgb = function(offset) {
  var rgb = this.options.rgb
    , add = function(a) {
      var result = a + offset
      if(result > 255) result = 255
      if(result < 0)   result = 0
      return result
    }

  offset = offset || 0

  return [add(rgb.red), add(rgb.green), add(rgb.blue)].join(',')
}

Dashboard.Chart.prototype.__defineGetter__('maxValue', function() {
  return this
    .values
    .reduce(function(value, prevValue) {
      return (value > prevValue) ? value : prevValue
    }, 0)
})

Dashboard.Chart.prototype._generatePathString = function() {
  var path = 'M0,%{height}L%{valuePath}L%{width},%{height}Z'
    , self = this

  var valuePath = this.values.map(function(value, i) {
    return [self._valueToRelative(i, {lengthwise: true}), self._valueToRelative(value)].join(',')
  }).join('L')

  path = path
    .replace(new RegExp('%{height}', 'g'), this.options.height)
    .replace(new RegExp('%{width}', 'g'), this.options.width)
    .replace(new RegExp('%{valuePath}', 'g'), valuePath)

  return path
}

Dashboard.Chart.prototype._drawLabel = function(text, x, y) {
  var text = this.paper.text(100, 100, "heyho").attr({font: '12px Helvetica, Arial', fill: "#999000"})
  this.paper.set().push(text)
}

Dashboard.Chart.prototype._valueToRelative = function(value, options) {
  var ratX   = 1.0 * this.options.width / this.values.length
    , ratY   = 1.0 * this.options.height / this.maxValue
    , result = null

  options = $.extend({lengthwise: false}, options || {})

  if(options.lengthwise)
    result = (ratX * value)
  else
    result = this.options.height - (ratY * value)

  return result
}

Dashboard.Chart.prototype._valueToAbsolute = function(value, options) {
  var ratX   = 1.0 * this.options.width / this.values.length
    , ratY   = 1.0 * this.options.height / this.maxValue
    , result = null

  options = $.extend({lengthwise: false}, options || {})

  if(options.lengthwise)
    result = (ratX / value)
  else
    result = ((this.options.height - value) / ratY)

  return result
}

Dashboard.Chart.prototype._drawAxisLabels = function(labelCount) {
  var self   = this
    , maxY   = this.maxValue
    , values = []

  for(var i = 1; i < labelCount; i++) {
    values.push(maxY * i/labelCount)
  }

  values.forEach(function(value) {
    var text = self.paper.text(20, self._valueToRelative(value), parseInt(value).toString())
    self.paper.set().push(text.attr({'font-weight':'bold', 'fill': 'rgba(' + self._rgb(50) + ',1)'}))
  })
}

Dashboard.Chart.prototype._highlightValue = function(e) {
  var mouseX   = e.offsetX
    , mouseY   = e.offsetY
    , segment  = null
    , linePath = null
    , attrs    = {stroke: 'rgba(' + this._rgb() + ',1)', 'stroke-width': 2}

  segment = this._generatePathString().split('L').reduce(function(prev, seg) {
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

  var line   = this.paper.path(linePath).attr(attrs)
    , circle = this.paper.circle(segment.x, segment.y, 6)
                         .attr(jQuery.extend(attrs, { fill: 'rgba(' + this._rgb() + ',1)' }))
    , label  = this.paper.text(segment.x + 5, this.options.height - 10, this._valueToAbsolute(segment.y))
                         .attr({'font-weight':'bold', 'fill': 'rgba(' + this._rgb(50) + ',1)'})
    , labelWidth = label.getBBox().width
    , labelX = segment.x + (labelWidth / 2) + 5

  if (labelX + labelWidth > this.options.width)
    labelX = segment.x - (labelWidth / 2) - 5

  label.attr('x', labelX)

  this.highlights.forEach(function(highlight) { highlight.remove() })
  this.highlights.push(line)
  this.highlights.push(circle)
  this.highlights.push(label)
}
