"use client";

import { RequestWorkbench } from "../shared/components/request-workbench";
import { ResponsePanel } from "../shared/components/response-panel";
import { GRAPHQL_DOT_COLOR } from "./constants";
import { useGraphqlRequest } from "./hooks/use-graphql-request";
import { RequestPanel } from "./components/request-panel";

/**
 * GraphQL client page: sends GraphQL operations over HTTP POST. Reuses the
 * shared REST-style workbench, supplying a GraphQL-specific request panel.
 */
export default function GraphqlClientPage() {
  return (
    <RequestWorkbench
      useRequest={useGraphqlRequest}
      breadcrumb="GraphQL"
      colorFor={() => GRAPHQL_DOT_COLOR}
      renderRequestPanel={(args) => <RequestPanel {...args} />}
      renderResponsePanel={(response) => (
        <ResponsePanel
          response={response}
          emptyMessage="Send a GraphQL operation to see the response"
        />
      )}
    />
  );
}
