Dashboard.Chart.Helpers = {
  rgb: function(rgb, offset) {
    var add = function(a) {
      var result = a + offset

      if(result > 255) result = 255
      if(result < 0)   result = 0

      return result
    }

    offset = offset || 0

    return [add(rgb.red), add(rgb.green), add(rgb.blue)].join(',')
  },

  max: function(values) {
    return values.reduce(function(value, prevValue) {
      return (value > prevValue) ? value : prevValue
    }, 0)
  },

  valueToAbsolute: function(value, options) {
    var ratX   = 1.0 * options.width / options.values.length
      , ratY   = 1.0 * options.height / Dashboard.Chart.Helpers(options.values)
      , result = null

    options = $.extend({lengthwise: false}, options || {})

    if(options.lengthwise)
      result = (ratX / value)
    else
      result = ((options. height - value) / ratY)

    return result
  },

  valueToRelative: function(value, options) {
    var ratX   = 1.0 * options.width / options.values.length
      , ratY   = 1.0 * options.height / Dashboard.Chart.Helpers.max(options.values)
      , result = null

    options = $.extend({lengthwise: false}, options || {})

    if(options.lengthwise)
      result = (ratX * value)
    else
      result = options.height - (ratY * value)

    return result
  }
}
