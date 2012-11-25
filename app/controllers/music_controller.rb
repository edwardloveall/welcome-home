require 'rdio'

class MusicController < ApplicationController
  respond_to :json, :html

  # TODO:  Check for empty config values and error
  RDIO_CONSUMER_KEY = Rails.application.config.rdio_consumer_key
  RDIO_CONSUMER_SECRET = Rails.application.config.rdio_consumer_secret

  def heavyrotation
    puts "Initing Heavy Rotation..."

    user = params[:rdiouserid]
    track_limit = params[:limit]
    access_token = session[:at]
    access_token_secret = session[:ats]

    if user.nil? || user.empty? || track_limit.nil? || track_limit.empty?
      respond_to do |format|
        format.html { 
          flash.now[:error] = 'Bad Request:  Missing Parameters!'
          render :text => 'Bad Request:  Missing Parameters!'
        }
        format.js { render :text => 'Bad Request:  Missing Parameters!', :status => 500 }
      end
    end
    
    if access_token && access_token_secret
      # begin
        rdio = Rdio.new([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [access_token, access_token_secret])

      begin
        # API Call for Rdio user metadata
        puts "Calling API for user data..."
        currentUser = rdio.call('findUser', {:vanityName => user})['result']
        @username = currentUser['firstName'] + ' ' + currentUser['lastName']
        @avatar = currentUser['icon']
        @playlist = []
        user_id = currentUser['key']
      # FIXME: Catch specific exception
      rescue Exception => ne
        logger.warn "App Not Authenticated with Rdio.  Redirecting to login. (#{ne.message})"
        if ne.message.include? '403 Developer Inactive'
          redirect_to '/login'
        end
      end

        puts #Current User: {"@currentUser"}

        # API Call for list of heavy rotation albums for this user
        puts "Calling API for heavy rotation..."
        @heavyrotation = rdio.call('getHeavyRotation', {:user => user_id})['result']

        # API Calls for metadata on a track of each album
        @heavyrotation.each do |hr|
          rand_track = hr['trackKeys'][1 + rand(hr['trackKeys'].length-1)]
          puts "Calling API for random track..."
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
