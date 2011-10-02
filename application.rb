require "environment"

class Dashboard < Sinatra::Application
  get '/styles.css' do
    scss :styles
  end

  get '/' do
    erb :dashboard
  end
end
