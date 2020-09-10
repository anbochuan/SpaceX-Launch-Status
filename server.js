const express = require("express");
const cors = require("cors");
const graphqlHTTP = require("express-graphql");
const MyGraphQLSchema = require("./schema");

const app = express();

// Allow CROS-Origin
app.use(cors());

// create the entry point for any client who want to interact with GraphQL on our server
app.use(
  "/graphql",
  // graphqlHTTP will take a configuration object as param
  graphqlHTTP({
    schema: MyGraphQLSchema,
    // we can use graphiql as our IDE to test our queries and mutations
    graphiql: true,
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
