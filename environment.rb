require "sinatra"
require "sass"
require 'net/http'
require 'cgi'

set :views, File.dirname(__FILE__) + '/views'
set :public, File.dirname(__FILE__) + '/public'
