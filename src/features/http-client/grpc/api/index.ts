import { createStorageApi } from "../../shared/api/create-storage-api";
import { GrpcRequest } from "../types/grpc.types";
import { GRPC_REQUESTS_STORAGE_KEY } from "../constants";

const grpcRequestsApi = createStorageApi<GrpcRequest>(
  GRPC_REQUESTS_STORAGE_KEY,
  "grpc"
);

export default grpcRequestsApi;
