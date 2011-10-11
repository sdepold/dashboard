require "environment"

class Dashboard < Sinatra::Application
  get '/styles.css' do
    scss :styles
  end

  get '/' do
    erb :dashboard
  end

  get '/load' do
    url = CGI.unescape params[:url]
    uri = URI.parse(url)

    Net::HTTP.get uri
  end
end
