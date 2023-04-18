import { itAsync } from "../../../testing";
import { cleanup, concast } from "../Concast";
import { EMPTY, Observable, of, throwError } from "rxjs";

describe("concast", () => {
  itAsync("should complete with sync sources", resolve => {
    const values: unknown[] = [];

    concast([of(1), of(2), of(3)])
      .subscribe({
        next: value => values.push(value),
        complete: () => {
          expect(values).toEqual([1, 2, 3])
          resolve();
        }
      })
  });

  itAsync("should complete with async sources", resolve => {
    const values: unknown[] = [];
    let r: undefined | ((v: Observable<unknown>[]) => void);
    const promise = new Promise<Observable<unknown>[]>(resolve => r = resolve);

    concast(promise)
      .subscribe({
        next: value => values.push(value),
        complete: () => {
          expect(values).toEqual([1, 2, 3])
          resolve();
        }
      })

    r!([of(1), of(2), of(3)]);
  });

  itAsync("second subscriber should get latest result", resolve => {
    const values: unknown[] = [];
    const values2: unknown[] = [];
    const observable = concast([of(1), of(2), of(3)]);

    observable
      .subscribe({
        next: value => values.push(value),
        complete: () => {
          expect(values).toEqual([1, 2, 3])

          observable
            .subscribe({
              next: value => values2.push(value),
              complete: () => {
                expect(values2).toEqual([3])
                resolve();
              }
            })
        }
      })
  });

  itAsync("broadcast errors too", resolve => {
    const values1: unknown[] = [];
    const values2: unknown[] = [];
    const error = new Error('my-error');
    const observable = throwError(() => error);

    observable
      .subscribe({
        next: value => values1.push(value),
        error: e => {
          expect(values1).toEqual([])
          expect(e).toBe(error)

          observable
            .subscribe({
              next: value => values2.push(value),
              error: e => {
                expect(values2).toEqual([])
                expect(e).toBe(error)

                resolve();
              }
            })
        }
      })
  });

  // This is different from legacy `Concast` class that used to emit no value at all before erroring
  itAsync("broadcast result then errors too", resolve => {
    const values1: unknown[] = [];
    const values2: unknown[] = [];
    let error1: any;
    const observable = concast([of(1), of(2), throwError(() => new Error('my-error')), of(3)]);

    observable
      .subscribe({
        next: value => values1.push(value),
        error: error => {
          error1 = error;
          expect(values1).toEqual([1, 2])
          expect(error1.message).toBe('my-error')

          observable
            .subscribe({
              next: value => values2.push(value),
              error: error => {
                expect(values2).toEqual([2])
                expect(error).toBe(error1)

                resolve();
              }
            })
        }
      })
  });
});


describe("cleanup", () => {
  itAsync("should cleanup on first next", resolve => {
    const values: unknown[] = [];
    const mockCallback = jest.fn();

    of(1, 2, 3).pipe(
      cleanup(mockCallback)
    )
      .subscribe({
        next: value => {
          expect(mockCallback).toHaveBeenCalledTimes(1);
          values.push(value)
        },
        complete: () => {
          expect(mockCallback).toHaveBeenCalledTimes(1);
          expect(values).toEqual([1, 2, 3])
          resolve();
        }
      })
  });

  itAsync("should cleanup on complete", resolve => {
    const mockCallback = jest.fn();

    EMPTY.pipe(
      cleanup(mockCallback)
    )
      .subscribe({
        complete: () => {
          expect(mockCallback).toHaveBeenCalledTimes(1);
          resolve();
        }
      })
  });

  itAsync("should cleanup on error", resolve => {
    const mockCallback = jest.fn();

    throwError(() => new Error('my-error')).pipe(
      cleanup(mockCallback)
    )
      .subscribe({
        error: () => {
          expect(mockCallback).toHaveBeenCalledTimes(1);
          resolve();
        }
      })
  });
});
