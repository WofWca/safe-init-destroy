/**
 * @license
 * Copyright 2022 WofWca <wofwca@protonmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */


/**
 * @typedef {DestrucionManager['onDestroyCallbacks'][number]} Callback
 */

// TODO more understandable name?
export class DestrucionManager {
  constructor() {
    /**
     * @private
     * @type {Array<() => void | Promise<void>>}
     */
    this.onDestroyCallbacks = [];
    /**
     * Add a callback to invoke when {@link DestrucionManager.destroy} is called.
     * If this is called _after_ {@link DestrucionManager.destroy} has already been called,
     * invoke the callback immediately.
     * @public
     * @type {(callback: Callback) => void}
     * @param {Callback} callback
     */
    this.onDestroy = this._onDestroyRegular;
  }

  /**
   * @private
   * @param {Callback} callback
   */
  _onDestroyRegular(callback) {
    this.onDestroyCallbacks.push(callback);
  }
  /**
   * @private
   * @param {Callback} callback
   */
  _onDestroyAfterDestroyCalled(callback) {
    // TODO it may not always be the desired behavior, because it's a bit weird of the user to add
    // callbacks after `destroy` has already been called. Other behaviors to consider:
    // * Throw error.
    // * Invoke the callback and throw error.
    // * Invoke the callback and show a warning.
    // * Return a different value if it's the case.
    // TODO maybe we can make the caller explicitly guarantee (through TypeScript, let's say)
    // that `destroy` has NOT been called yet before they can call this function.
    // Hey, how about do something like `this.onDestroy = undefined`? So thay they have to check
    // if the function is there?
    callback();
  }

  // TODO `destrucionManager.destroy()` may be misunderstood as if it just destroys the class
  // itself, and not that it actually calls the `onDestroy` callbacks.
  // async doDestroy() {
  // async performDestroy() {
  // async performDestroy() {
  /**
   * Invoke all the callbacks that were added by calling {@link DestrucionManager.onDestroy}.
   * Callbacks are executed in the same order they were added.
   * If a callback returns a `Promise` (e.g. it's an async function), then wait for it to resolve
   * before invoking the next callback.
   * If none of the callbacks retun a `Promise`, they are all executed synchronously,
   * before this function returns.
   * @public
   * @example
   * onDestroy(() => console.log('first'));
   * onDestroy(() => new Promise(r => setTimeout(r)));
   * onDestroy(() => console.log('last'));
   * destroy();
   * console.log('`destroy` returned');
   * // This prints:
   * // first
   * // `destroy` returned
   * // last
   */
  async destroy() {
    this.onDestroy = this._onDestroyAfterDestroyCalled;

    for (const cb of this.onDestroyCallbacks) {
      // TODO option to `Promise.all(this.onDestroyCallbacks.map(cb => cb()))`,
      // so that all callbacks get started in parallel; resolve once they're all done.
      const cbRetVal = cb();
      // Why not just do `await cb()` every time? It's so that if no callback returns a `Promise`
      // then execute all them synchronously, before `destroy` returns.
      // TODO perf: maybe make a simplified version of this function.
      if (cbRetVal instanceof Promise) {
        await cbRetVal;
      }
    }
  }
}

// TODO the fact that we have this function really makes it look we don't need a class here.
// TODO docstrings?
export function createDestructionManager() {
  const destrucionManager = new DestrucionManager();
  // Be careful, `.bind()` won't work here because we reassign `onDestroy`.
  return {
    /** @type {typeof destrucionManager.onDestroy} */
    onDestroy: (...args) => destrucionManager.onDestroy(...args),
    /** @type {typeof destrucionManager.destroy} */
    destroy: (...args) => destrucionManager.destroy(...args),
  };
}
