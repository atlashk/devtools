import { createStorageApi } from "../../shared/api/create-storage-api";
import { GraphQLRequest } from "../types/graphql.types";
import { GRAPHQL_REQUESTS_STORAGE_KEY } from "../constants";

const graphqlRequestsApi = createStorageApi<GraphQLRequest>(
  GRAPHQL_REQUESTS_STORAGE_KEY,
  "graphql"
);

export default graphqlRequestsApi;
