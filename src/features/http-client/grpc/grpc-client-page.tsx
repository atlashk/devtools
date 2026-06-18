"use client";

import { RequestWorkbench } from "../shared/components/request-workbench";
import { ResponsePanel } from "../shared/components/response-panel";
import { GRPC_DOT_COLOR } from "./constants";
import { useGrpcRequest } from "./hooks/use-grpc-request";
import { RequestPanel } from "./components/request-panel";

/**
 * gRPC client page: invokes unary methods via gRPC-JSON transcoding / the
 * Connect protocol over HTTP. Reuses the shared REST-style workbench.
 */
export default function GrpcClientPage() {
  return (
    <RequestWorkbench
      useRequest={useGrpcRequest}
      breadcrumb="gRPC"
      colorFor={() => GRPC_DOT_COLOR}
      requestLabel="Request"
      responseLabel="Response"
      renderRequestPanel={(args) => <RequestPanel {...args} />}
      renderResponsePanel={(response) => (
        <ResponsePanel
          response={response}
          emptyMessage="Invoke a method to see the response"
        />
      )}
    />
  );
}
