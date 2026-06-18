import { createStorageApi } from "../../shared/api/create-storage-api";
import { WsConnection } from "../types/websocket.types";
import { WS_CONNECTIONS_STORAGE_KEY } from "../constants";

const wsConnectionsApi = createStorageApi<WsConnection>(
  WS_CONNECTIONS_STORAGE_KEY,
  "ws"
);

export default wsConnectionsApi;
