WelcomeHome::Application.routes.draw do
  resources :users
  resources :current_users, only: [:index]
  match '/heavyrotation' => "music#heavyrotation", :as => :heavyrotation
  match '/login' => "music#login", :as => :login
  match '/logout' => "music#logout", :as => :logout
  match '/callback' => "music#callback", :as => :callback
  root :to => 'users#index'
end
