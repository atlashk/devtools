import { createRequestStore } from "../../shared/store/create-request-store";
import { ACTIVE_GRAPHQL_REQUEST_ID_KEY } from "../constants";
import { GraphQLRequest, GraphQLResponse } from "../types/graphql.types";

export const graphqlStore = createRequestStore<GraphQLRequest, GraphQLResponse>(
  ACTIVE_GRAPHQL_REQUEST_ID_KEY
);

export const useGraphqlStore = graphqlStore.useStore;
export const graphqlSelectors = graphqlStore.selectors;
