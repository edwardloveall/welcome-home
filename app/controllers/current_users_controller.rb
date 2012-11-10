class CurrentUsersController < ApplicationController
  respond_to :json, :html

  def fetch
    require 'nokogiri'
    require 'open-uri'

    router_devices_url = 'http://192.168.1.1/DEV_device.htm'
    doc = Nokogiri::HTML(open(router_devices_url))

    connected_users = []

    # Cycle through rows, and build hash from appropriate cells
    doc.xpath('//tr').each do |row|
      user = {}
      row.xpath('td/span').each_with_index do |cell, i|
        if i == 3 && cell.content != 'MAC Address'
          user[:mac] = cell.content
        end

        if i == 2 && cell.content != 'Device Name '
          user[:name] = cell.content
        end
      end
      # Add user unless we didn't find one for this row
      connected_users << user unless user.keys.length == 0
    end

    connected_users.each do |current_user|
      u = User.find_by_mac(current_user[:mac])
      if u.nil?
        puts "NEW USER for MAC #{current_user[:mac]}"
        User.new(:device_name => current_user[:device_name], :mac => current_user[:mac]).save
      else
        puts "FOUND USER for MAC #{current_user[:mac]}"
      end
    end

  end

  def index
    @addresses = fetch

    respond_with(@addresses) do |format|
      format.html
      format.json { render :json => @addresses }
    end
  end
end
