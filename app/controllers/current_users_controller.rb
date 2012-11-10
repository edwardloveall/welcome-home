class CurrentUsersController < ApplicationController
  respond_to :json, :html

  def fetch
    require 'nokogiri'
    require 'open-uri'

    router_devices_url = 'http://192.168.1.1/DEV_device.htm'
    doc = Nokogiri::HTML(open(router_devices_url))

    connected_users = []

    doc.xpath('//td/span').each_with_index do |cell, i|
      if (i % 4 == 3) && cell.content != 'MAC Address'
        connected_users << cell.content
      end
    end

    connected_users
  end

  def index
    @addresses = fetch

    respond_with(@addresses) do |format|
      format.html
      format.json { render :json => @addresses }
    end
  end
end
