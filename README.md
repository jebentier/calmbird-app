# Calmbird

This is an Open Source project started from the idea that Twitter needs a
better way to handle the influx of information.  Calmbird is a Twitter wrapper
that allows a user to filter out the noise and focus on the important tweets.

Due to the nature of Twitter, Calmbird is not a replacement for the official
Twitter client.  It is a tool to help you manage your Twitter experience.

Because of limitations in the Twitter API, the Calmbird server is not publically
hosted by any one person or company, and instead an API key and server can be hosted
anywhere by anyone, and the client can be configured to use any server that's available.

## Server

The server is a Ruby on Rails application that acts as a proxy between the client and
the Twitter API. It was originally designed to be easily hosted on Heroku's free tier,
but can be hosted anywhere that supports Ruby on Rails with a Postgres database.

## Client

The client is a React Native application that leverages Expo is designed to be easily
compiled for Android and iOS. It is not released on the iOS or Android app stores currently,
but if there is enough traction, we may release an official version of the client for both
platforms.

## Contributing

This project is open source and contributions are welcome.  If you would like to contribute,
please fork the repository and submit a pull request.

### Local Development

To developer or use Calmbird locally you will need the following installed:

* Ruby 3.x
* Node 16.x
* Postgres 13.x

To run the server locally, you will need to create your own Twitter API key and secret through
their developer portal.  Once you have those, you can run `bin/setup` from within the `server`
directory to install the necessary dependencies as well as create a `.env` file with the
necessary environment variables. For there you can run `bundle exec rails s` to start the server.

To run the client locally, you will need to run `npm install` from within the `client` directory
to install the necessary dependencies and then `npm start` to start the Expo development server.
