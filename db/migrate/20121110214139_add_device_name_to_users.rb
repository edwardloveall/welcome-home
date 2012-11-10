class AddDeviceNameToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :device_name, :string
  end
end
