const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const fs = require('fs');
const resolvers = require('./resolvers');

const port = 9000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

const typeDefs = gql(fs.readFileSync('./schema.graphql', {encoding: 'utf-8'}));


const app = express();
app.use(cors(), bodyParser.json(), expressJwt({
  secret: jwtSecret,
  credentialsRequired: false
}));

// if want to disable playground at localhost:9000/graphql,
// then include playground: false in object args
const graphqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({ user: req.user && db.users.get(req.user.sub)})
 });
graphqlServer.applyMiddleware({app})

// Apollo Server V1 code:
// const schema = makeExecutableSchema({typeDefs, resolvers});
// app.use('/graphql', graphqlExpress(req => {
//   return { schema,
//     context: { user: req.user && db.users.get(req.user.sub) }
//     }
//   })
// );
// app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = db.users.list().find((user) => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({sub: user.id}, jwtSecret);
  res.send({token});
});

app.listen(port, () => console.info(`Server started on port ${port}`));
