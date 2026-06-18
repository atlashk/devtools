import { createRequestStore } from "../../shared/store/create-request-store";
import { ACTIVE_REST_REQUEST_ID_KEY } from "../constants";
import { RestRequest, RestResponse } from "../types/rest.types";

export const restStore = createRequestStore<RestRequest, RestResponse>(
  ACTIVE_REST_REQUEST_ID_KEY
);

export const useRestStore = restStore.useStore;
export const restSelectors = restStore.selectors;
