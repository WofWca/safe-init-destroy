# safe-init-destroy

If you have a function called `destroy` (or `deinit`) and it is longer than 3 lines, you may want to rewrite it using this approach.

## Example

<!-- TODO maybe we should "inline" the `doSomething` functions. May be confusing. -->

<table>
  <thead>
    <tr>
      <td>Before</td>
      <td>After</td>
    </tr>
  <thead>
    <tbody>
      <tr>
<td>

```js
// ...





function init() {
  doSomething();

  // ...
  doSomethingElse();

  // ...
  if (cond) {
    doSomeOtherThing();

  }
}
function destroy() {
  undoSomething();
  undoSomethingElse();
  if (didDoSomeOtherThing) {
    undoSomeOtherThing();
  }
}
// ...
```

</td>
<td>

```diff js
// ...
+const {
+  onDestroy,
+  destroy
+} = createDestructionManager();
 
 function init() {
   doSomething();
+  onDestroy(() => undoSomething());
   // ...
   doSomethingElse();
+  onDestroy(() => undoSomethingElse());
   // ...
   if (cond) {
     doSomeOtherThing();
+    onDestroy(() => undoSomeOtherThing());
   }
 }
-function destroy() {
-  undoSomething();
-  undoSomethingElse();
-  if (didDoSomeOtherThing) {
-    undoSomeOtherThing();
-  }
-}
 // ...
```

</td>
        </tr>
    </tbody>
</table>

Such code is much more maintainable because all the related things are grouped together. If you change one piece of code, you won't forget to update its corresponding `destroy()` part (or vice versa), because it's immediately next to it (perhaps even inside the same nested code block).

<!-- TODO add async examples
* Where `destroy` can be called before `init` has finished.
* (maybe as a part of the previous point) Where in the init method we check if 
* Where we do some initialization outside of the `init` method, dynamically, (say, inside a different method) i.e. we don't know if that thing is going to be initialized. -->

## Feedback wanted

I would like to hear feedback on this approach. I don't know why I havent's seen it implemented in the wild, yet I _have_ seen bloated `destroy` methods that look like they can break from a breath of wind (no offence). If you have seen similar code (even in different languages), or code that solves the same problem, or code that manages to avoid this problem, please let me know.
