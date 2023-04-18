import { MonoTypeOperatorFunction, tap } from "rxjs";

export {
  Observable,
  PartialObserver as Observer,
  Subscription as ObservableSubscription,
} from "rxjs";

/**
 * For debugging purpose only, will dump in console everything that happen to
 * the observable
 */
export function debug<T>(debugName: string): MonoTypeOperatorFunction<T> {
  return tap<T>({
    subscribe: () => console.log('SUBSCRIBE', debugName),
    unsubscribe: () => console.log('UNSUBSCRIBE', debugName),
    next: value => console.log('NEXT', debugName, value),
    error: error => console.log('ERROR', debugName, error),
    complete: () => console.log('COMPLETE', debugName),
  });
}
