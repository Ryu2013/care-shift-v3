FROM ruby:3.3
ENV LANG C.UTF-8
ENV TZ Asia/Tokyo
WORKDIR /app


RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential pkg-config default-libmysqlclient-dev default-mysql-client \
  && gem install bundler \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

