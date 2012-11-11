require 'rdio'

class MusicController < ApplicationController
  respond_to :json, :html

  RDIO_CONSUMER_KEY = 'xg4k5jvs9fceuebstg83z3t7'
  RDIO_CONSUMER_SECRET = 'GjMfpnZf7Z'

  def heavyrotation

    user = params[:rdiouserid]
    track_limit = params[:limit]
    access_token = session[:at]
    access_token_secret = session[:ats]

    if access_token && access_token_secret
      # begin
        rdio = Rdio.new([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [access_token, access_token_secret])

        # API Call for Rdio user metadata
        currentUser = rdio.call('findUser', {:vanityName => user})['result']
        @username = currentUser['firstName'] + ' ' + currentUser['lastName']
        @avatar = currentUser['icon']
        @playlist = []
        user_id = currentUser['key']

        puts #Current User: {"@currentUser"}

        # API Call for list of heavy rotation albums for this user
        @heavyrotation = rdio.call('getHeavyRotation', {:user => user_id})['result']

        # API Calls for metadata on a track of each album
        @heavyrotation.each do |hr|
          rand_track = hr['trackKeys'][1 + rand(hr['trackKeys'].length-1)]
          track_md = rdio.call('get', {:keys => rand_track})['result'][rand_track]
          @playlist << {:user_id => user_id, :user_name => @username, :track_id => track_md['key'], :track_name => track_md['name'], :track_artist => track_md['albumArtist']}
          puts track_md

          if @playlist.length == track_limit.to_i
            break
          end
        end

        #Return all track metadata
        respond_with(@playlist) do |format|
          format.html
          format.json { render :json => @playlist }
        end
    # rescue Exception => e
    #   puts e.message
    #
    #   respond_to do |format|
    #     format.html {
    #       flash.now[:error] = "There was a problem with the RDIO HTTP request."
    #       render :text => "Error with RDIO Request"
    #     }
    #     format.js { render :text => e.message, :status => 500 }
    #   end
    # end
    else
      # Log in
      puts "Not Logged In"
    end
  end

  def login
    # begin the authentication process
    rdio = Rdio.new([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET])
    callback_url = (URI.join request.url, '/callback').to_s
    url = rdio.begin_authentication(callback_url)
    # save our request token in the session
    session[:rt] = rdio.token[0]
    session[:rts] = rdio.token[1]
    # go to Rdio to authenticate the app
    redirect_to url
  end

  def callback
    # get the state from cookies and the query string
    request_token = session[:rt]
    request_token_secret = session[:rts]
    verifier = params[:oauth_verifier]
    # make sure we have everything we need
    if request_token && request_token_secret && verifier
      # exchange the verifier and request token for an access token
      rdio = Rdio.new([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                    [request_token, request_token_secret])
      rdio.complete_authentication(verifier)
      # save the access token in cookies (and discard the request token)
      session[:at] = rdio.token[0]
      session[:ats] = rdio.token[1]
      session.delete(:rt)
      session.delete(:rts)

      redirect_to '/heavyrotation'
  end
  end

  def logout
    session.clear
    redirect_to '/heavyrotation'
  end

end
