WelcomeHome::Application.routes.draw do
  resources :users
  resources :current_users, only: [:index]

  root :to => 'admin#index'
end
