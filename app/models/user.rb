class User < ActiveRecord::Base
  attr_accessible :name, :mac, :themesong_url
end
