import { createRequestStore } from "../../shared/store/create-request-store";
import { ACTIVE_GRPC_REQUEST_ID_KEY } from "../constants";
import { GrpcRequest, GrpcResponse } from "../types/grpc.types";

export const grpcStore = createRequestStore<GrpcRequest, GrpcResponse>(
  ACTIVE_GRPC_REQUEST_ID_KEY
);

export const useGrpcStore = grpcStore.useStore;
export const grpcSelectors = grpcStore.selectors;
