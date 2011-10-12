require 'sinatra'
require 'sass'
require 'net/http'
require 'cgi'
require 'rubygems'
require 'json'

set :views, File.dirname(__FILE__) + '/views'
set :public, File.dirname(__FILE__) + '/public'
