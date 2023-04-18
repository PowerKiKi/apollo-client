import { Observable } from "./Observable";
import { concatAll, from, MonoTypeOperatorFunction, of, ReplaySubject, share, switchMap, tap } from 'rxjs';

type MaybeAsync<T> = T | PromiseLike<T>;

function isPromiseLike<T>(value: MaybeAsync<T>): value is PromiseLike<T> {
  return value && typeof (value as any).then === "function";
}

// Any individual Source<T> can be an Observable<T> or a promise for one.
type Source<T> = Observable<T>;

export type ConcastSourcesIterable<T> = Iterable<Source<T>>;

export function concast<T>(sources: MaybeAsync<ConcastSourcesIterable<T>>): Observable<T> {
  const observableSources: Observable<ConcastSourcesIterable<T>> = isPromiseLike(sources) ? from(sources) : of(sources);

  return observableSources.pipe(
    switchMap(finalSources => from(finalSources)),
    concatAll(),
    // replay 1 result to new subscribers and also the complete or error notification
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    })
  );
}

/**
 * Will run the callback at most 1 time, whenever a next/error/complete happens first
 */
export function cleanup<T>(callback: () => unknown): MonoTypeOperatorFunction<T> {

  let called = false;
  const once = () => {
    if (!called) {
      called = true;
      callback();
    }
  }

  return tap<T>({
    next: once,
    error: once,
    complete: once,
  });
}
