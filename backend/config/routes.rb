Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, path: "/api/users", controllers: {
    sessions: "api/users/sessions",
    registrations: "api/users/registrations",
    invitations: "api/users/invitations",
    confirmations: "api/users/confirmations",
    omniauth_callbacks: "api/users/omniauth_callbacks",
    passwords: "api/users/passwords",
    unlocks: "api/users/unlocks"
  }

  mount ActionCable.server => "/api/cable"

  namespace :api do
    # 管理者用
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

    # 従業員用
    namespace :employee do
      resources :shifts, only: %i[index update]
    end

    # 共通
    resources :users, only: %i[index]
    resources :shifts, only: %i[index update]

    resources :rooms, only: %i[index show create update destroy] do
      resources :messages, only: %i[index create]
      resources :entries, only: %i[create destroy], shallow: true
    end

    resource :two_factor, only: [] do
      get :setup
      post :confirm
    end

    get "csrf", to: "csrf#index"
    get "me", to: "me#show"
    post "stripe/webhook", to: "stripe/webhooks#create"

    # E2Eテスト用
    if Rails.env.development? || Rails.env.test?
      namespace :test_support do
        resources :users, only: :create
        resources :work_status_scenarios, only: :create
      end
    end
  end

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/api/letter_opener"
  end

end
