import { QueryManager } from '../../../core/QueryManager';
import { mockSingleLink, MockedResponse } from './mockLink';
import { InMemoryCache } from '../../../cache';
import { ApolloQueryResult, NetworkStatus, WatchQueryOptions } from "../../../core";
import { Observable } from "rxjs";
import { cloneDeep } from "../../../utilities";

class MockQueryManager extends QueryManager<any> {
  public readonly optionsUsed: WatchQueryOptions[] = [];

  constructor(...mockedResponses: MockedResponse[]) {
    super({
      link: mockSingleLink(...mockedResponses),
      cache: new InMemoryCache({addTypename: false}),
    });
  }

  public override fetchQueryObservable<TData, TVars>(queryId: string, options: WatchQueryOptions<TVars, TData>, networkStatus: NetworkStatus = NetworkStatus.loading): Observable<ApolloQueryResult<TData>> {
    this.optionsUsed.push(cloneDeep(options))

    return super.fetchQueryObservable(queryId, options, networkStatus);
  }
}

// Helper method for the tests that construct a query manager out of
// a list of mocked responses for a mocked network interface.
export default function mockQueryManager(
  reject: (reason: any) => any,
  ...mockedResponses: MockedResponse[]
) : MockQueryManager {
  return new MockQueryManager(...mockedResponses)
};
