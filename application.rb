require "environment"

class Dashboard < Sinatra::Application
  CONFIG = JSON.parse(File.open('config.json').read)

  get '/styles.css' do
    scss :styles
  end

  get '/' do
    @page = (params[:page] || 0).to_i
    @config = CONFIG
    erb :dashboard
  end

  get '/load' do
    url = CGI.unescape params[:url]
    uri = URI.parse(url)

    Net::HTTP.get uri
  end

  get '/generate_graphite' do
    result = ''
    result << "summarize(foo, \"1min\"),#{(Time.now - 4*60*60).to_i},#{Time.now.to_i},60|0.0,"
    result << (0..100).to_a.map{|i| 500 * rand + 1500 * rand }.join(',')
    result << "\n"
    result << "summarize(bar, \"1min\"),#{(Time.now - 4*60*60).to_i},#{Time.now.to_i},60|0.0,"
    result << (0..100).to_a.map{|i| 500 * rand + 1500 * rand }.join(',')
    result << "\n"
    result << "drawAsInfinite(barfooz),1317461450,1317468650,10|0.0,0.0"
    result
  end
end
