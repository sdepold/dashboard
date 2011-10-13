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
end
