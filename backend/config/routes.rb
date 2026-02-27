Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    devise_for :users, controllers: {
      sessions: "api/users/sessions",
      registrations: "api/users/registrations",
      invitations: "api/users/invitations",
      omniauth_callbacks: "api/users/omniauth_callbacks"
    }

    resources :teams, only: %i[index create update destroy]
    resources :users, only: %i[index update destroy]
    resources :clients, only: %i[index create update destroy]
    resources :client_needs, only: %i[index create destroy]
    resources :user_clients, only: %i[create destroy]
    resources :shifts, only: %i[index create update destroy] do
      post :generate_monthly, on: :collection
    end
    resources :work_statuses, only: %i[index]
    resources :rooms, only: %i[index show create update destroy] do
      resources :messages, only: %i[index create]
      resources :entries, only: %i[create destroy], shallow: true
    end
    resource :office, only: %i[show update]

    resource :subscription, only: [] do
      post :subscribe
      post :portal
    end
  end

  post "/api/stripe/webhook", to: "api/stripe_webhooks#create"
end
