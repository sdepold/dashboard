Dashboard.Chart.Graphite = function(options, defaults) {
  this.chart = null
  this.options = options || {}
  this.defaults = defaults || {}
  this.dataRequest = $.get(this.optionsToUrl())
}

Dashboard.Chart.Graphite.prototype.render = function(domElement) {
  domElement = domElement || jQuery("<div class='item graphite'></div>").appendTo(jQuery("#items")).get(0)

  var self = this
    , chartOptions = this.getChartOptions(domElement)

  this.dataRequest.success(function(data) {
    var graphData = self.extractData(data)
      , values = []
      , timestamps = null

    graphData.forEach(function(data, i) {
      if(i < (graphData.length-1)) {
        var _values = data.values.map(function(value){ return parseInt(parseFloat(value) * 100) / 100.0 })

        values.push(_values)
        timestamps = timestamps || data.timestamps
      }
    })

    new Dashboard.Chart(chartOptions).render(values, timestamps)
  })
}

// private

Dashboard.Chart.Graphite.prototype.optionsToUrl = function() {
  return decodeURIComponent('/load?url=http%3A%2F%2Flocalhost%3A9393%2Fgenerate_graphite')
}

Dashboard.Chart.Graphite.prototype.extractData = function(data) {
  var graphData = data.split('\n').map(function(line) {
    if(line.length > 0) {
      var title      = line.match(/(.*\))/)[0]
        , values     = line.replace(title + ',', '').split(',')
        , tStart     = parseInt(values[0])
        , tEnd       = parseInt(values[1])
        , tDiff      = tEnd - tStart
        , timestamps = [tStart, tStart + tDiff * 0.25, tStart + tDiff * 0.5, tStart + tDiff * 0.75, tEnd]

      timestamps = timestamps.map(function(t) {
        return $.format.date(new Date(t * 1000), "hh:mm")
      })
      return { title: title, values: values.slice(3), timestamps: timestamps }
    }
  })
  return graphData.filter(function(hash) { return !!hash })
}

Dashboard.Chart.Graphite.prototype.getChartOptions = function(domElement) {
  var chartOptions = jQuery.extend(this.defaults.graphite || {}, { domElement: domElement })
  chartOptions = jQuery.extend(chartOptions, this.options)

  return chartOptions
}
