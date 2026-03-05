Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, path: "/api/users", controllers: {
    sessions: "api/users/sessions",
    registrations: "api/users/registrations",
    invitations: "api/users/invitations",
    confirmations: "api/users/confirmations",
    omniauth_callbacks: "api/users/omniauth_callbacks",
    unlocks: "api/users/unlocks"
  }

  namespace :api do

    namespace :admin do
      resources :teams, only: %i[index create update destroy]
      resources :users, only: %i[index update destroy]
      resources :clients, only: %i[index create update destroy]
      resources :client_needs, only: %i[index create destroy]
      resources :user_clients, only: %i[create destroy]
      resources :shifts, only: %i[index create update destroy] do
        post :generate_monthly, on: :collection
      end
      resources :work_statuses, only: %i[index]
      resource :office, only: %i[show update]
      resource :subscription, only: [] do
        post :subscribe
        post :portal
      end
    end

    resources :rooms, only: %i[index show create update destroy] do
      resources :messages, only: %i[index create]
      resources :entries, only: %i[create destroy], shallow: true
    end
    get 'me', to: 'me#show'

    resource :two_factor, only: [] do
      get :setup
      post :confirm
    end

    namespace :employee do
      resources :shifts, only: %i[index update]
    end
  end

  post "/api/stripe/webhook", to: "api/stripe/webhooks#create"

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/api/letter_opener"
  end
end
