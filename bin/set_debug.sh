docker-compose up -d && docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
