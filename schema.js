const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = require("graphql");

// Launch Type
const LaunchType = new GraphQLObjectType({
  // the name of this type
  name: "Launch",
  fields: () => {
    return {
      flight_number: { type: GraphQLInt },
      mission_name: { type: GraphQLString },
      launch_year: { type: GraphQLString },
      launch_date_local: { type: GraphQLString },
      launch_success: { type: GraphQLBoolean },
      rocket: { type: RocketType },
    };
  },
});

// Rocket Type
const RocketType = new GraphQLObjectType({
  // the name of this type
  name: "Rocket",
  fields: () => {
    return {
      rocket_id: { type: GraphQLString },
      rocket_name: { type: GraphQLString },
      rocket_type: { type: GraphQLString },
    };
  },
});

// Launch & Rocket Type
const LaunchRocketType = new GraphQLObjectType({
  // the name of this type
  name: "LaunchRocket",
  fields: () => {
    return {
      mission_name: { type: GraphQLString },
      rocket_name: { type: GraphQLString },
    };
  },
});

// Customer Type
const CustomerType = new GraphQLObjectType({
  // the name of this type
  name: "Customer",
  fields: () => {
    return {
      id: { type: GraphQLString },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      age: { type: GraphQLInt },
    };
  },
});

// root query
// create endpoint that have resolvers that will resolve our data
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    launches: {
      type: new GraphQLList(LaunchType),
      resolve(parent, args) {
        return axios
          .get("https://api.spacexdata.com/v3/launches")
          .then((res) => res.data);
      },
    },
    launch: {
      type: LaunchType,
      args: {
        flight_number: { type: GraphQLInt },
      },
      resolve(parent, args) {
        return axios
          .get("https://api.spacexdata.com/v3/launches/" + args.flight_number)
          .then((res) => res.data);
      },
    },
    launchRocket: {
      type: LaunchRocketType,
      args: {
        flight_number: { type: GraphQLInt },
        rocket_id: { type: GraphQLString },
      },

      resolve(parent, args) {
        return axios
          .all([
            axios.get(
              "https://api.spacexdata.com/v3/launches/" + args.flight_number
            ),
            axios.get(
              "https://api.spacexdata.com/v3/rockets/" + args.rocket_id
            ),
          ])
          .then((responses) => {
            // mission_name = responses[0].data["mission_name"];
            // rocket_name = responses[1].data["rocket_name"];
            console.log("1" + JSON.stringify(responses[0].data));
            console.log("2" + JSON.stringify(responses[1].data));
          })
          .catch((errors) => {
            console.log("error msg: " + errors.message);
          });
      },
    },
    rockets: {
      type: new GraphQLList(RocketType),
      resolve(parent, args) {
        return axios
          .get("https://api.spacexdata.com/v3/rockets")
          .then((res) => res.data);
      },
    },
    rocket: {
      type: RocketType,
      args: {
        rocket_id: { type: GraphQLString },
      },
      resolve(parent, args) {
        return axios
          .get("https://api.spacexdata.com/v3/rockets/" + args.rocket_id)
          .then((res) => res.data);
      },
    },
    //
    customer: {
      type: CustomerType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .get("http://localhost:3000/customers/" + args.id)
          .then((res) => res.data);
      },
    },
    customers: {
      type: new GraphQLList(CustomerType),
      resolve(parentValue, args) {
        return axios
          .get("http://localhost:3000/customers")
          .then((res) => res.data);
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addCustomer: {
      type: CustomerType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parentValue, args) {
        return axios
          .post("http://localhost:3000/customers", {
            name: args.name,
            email: args.email,
            age: args.age,
          })
          .then((res) => res.data);
      },
    },
    deleteCustomer: {
      type: CustomerType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        return axios
          .delete("http://localhost:3000/customers/" + args.id)
          .then((res) => res.data);
      },
    },
    updateCustomer: {
      type: CustomerType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parentValue, args) {
        return axios
          .put("http://localhost:3000/customers/" + args.id, args)
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});
