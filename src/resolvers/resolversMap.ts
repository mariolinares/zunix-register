import { IResolvers } from "graphql-tools";
import mutation from "./mutation";
import query from "./query";

const resolvers : IResolvers = {
    ...query,
    ...mutation
}

export default resolvers;