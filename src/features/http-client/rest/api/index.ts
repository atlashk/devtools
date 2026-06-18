import { createStorageApi } from "../../shared/api/create-storage-api";
import { RestRequest } from "../types/rest.types";
import { REST_REQUESTS_STORAGE_KEY } from "../constants";

const restRequestsApi = createStorageApi<RestRequest>(
  REST_REQUESTS_STORAGE_KEY,
  "req"
);

export default restRequestsApi;
