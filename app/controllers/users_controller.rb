class UsersController < ApplicationController
  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      redirect_to :controller => 'users', :action => 'index'
    else
      render :action => 'edit'
    end
  end
end
