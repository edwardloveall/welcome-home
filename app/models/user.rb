class User < ActiveRecord::Base
  attr_accessible :name, :mac, :themesong_url, :rdio_user, :device_name
end
