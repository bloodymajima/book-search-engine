const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const {Apolloserver} = require('@apollo/server');
const {expressMiddleware} = require('@apollo/server/express4');
const{authMiddleware} = require('./utils/auth');

const db = require('./config/connection');
const {typeDefs, resolvers} = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new Apolloserver({
  typeDefs,
  resolvers,
  context: authMiddleware
});

const startApolloServer = async () => {
  await server.start()
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
};  

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

startApolloServer();
