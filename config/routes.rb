WelcomeHome::Application.routes.draw do
  resources :users

  root :to => 'admin#index'
end
