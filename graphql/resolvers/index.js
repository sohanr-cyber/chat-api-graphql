import userResolver from "./users.js";
import chatResolver from "./chat.js";
import messageResolver from "./message.js";

const resolvers = {
  Mutation: {
    ...userResolver.Mutation,
    ...chatResolver.Mutation,
    ...messageResolver.Mutation,
  },

  Query: {
    ...userResolver.Query,
    ...chatResolver.Query,
    ...messageResolver.Query,
  },
};

export default resolvers;
