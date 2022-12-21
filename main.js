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

// // TODO making the user pass the array is a set up for breaking changes.
// // Maybe internalize this somehow. Through a class.
// // Or is it fine because we don't tell the user that it's an array?
// function destroy(onDestroyCallbacks) {
//   for (const cb of onDestroyCallbacks) {
    
//   }
// }
// // export function addOnDestroyCallback
// function onDestroy(onDestroyCallbacks, callback) {
//   // TODO an option to call the new callback immediately if `destroy` has already been called.
//   // OR make the caller explicitly guarantee (through TypeScript, let's say) that `destroy`
//   // has NOT been called yet.
//   onDestroyCallbacks.push(callback);
// }

/**
 * @typedef {DestrucionManager['onDestroyCallbacks'][number]} Callback
 */

// TODO more understandable name?
// class Janitor
// class OnDestroyTracker
// TODO add usage comment. If `destructionManager.onDestroy(...)` is clunky to call, you can do
// `const onDestroy = destructionManager.onDestroy.bind(destructionManager)`
export class DestrucionManager {
  constructor() {
    // this.destroyCalled = false;
    /**
     * @private
     * @type {Array<() => Awaited<void>>}
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

  // /**
  //  * @param {Callback} callback
  //  */
  // onDestroy(callback) {
  //   this.onDestroyCallbacks.push(callback);
  // }

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
  // TODO maybe say in the docstring that if no callback returns a `Promise` then all of them
  // will be invoked synchronously.
  // async doDestroy() {
  // async performDestroy() {
  // async performDestroy() {
  /**
   * Invoke all the callbacks that were added by calling {@link DestrucionManager.onDestroy}.
   * Callbacks are executed in the same order they were added.
   * If a callback returns a Promise (e.g. it's an async function), then wait for it to resolve
   * before invoking the next callback.
   * @public
   */
  async destroy() {
    this.onDestroy = this._onDestroyAfterDestroyCalled;

    for (const cb of this.onDestroyCallbacks) {
      // TODO option to `Promise.all(this.onDestroyCallbacks.map(cb => cb()))`,
      // so that all callbacks get started in parallel; resolve once they're all done.
      await cb();
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
