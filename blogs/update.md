# Update

We started analyzing Update from `setState()`, which is one of the two ways in React to make component update(the other one is by `props`). Before going into this, we recommendated you to read [Reconciliation](https://reactjs.org/docs/reconciliation.html) and you might know some perceptions like `keys` and `The Diffing Algorithm`.

OK here we go, this is the `setState()` codes:

```js
//Component.js

setState(partialState){
  this._pendingState = Object.assign({}, this.state, this.partialState)
  this._performUpdateIfNecessary()
}

performUpdateIfNecessary(){
  this.updateComponent(this._currentElement, this._currentElement)
}
```
Here we store the pending state and call a `performUpdateIfNecessary()`
```js
//Component.js

updateComponent(prevElement. nextElement){
  if (prevElement !== nextElement){
    // Component will be re-rendered because of the changes of props passed down from
    // parents. Here React will call componentWillReceiveProps()
  }
  // re-bookmarking
  this._currentElement = nextElement
  this.props = nextElement.props
  this.state = this._pendingState
  this._pendingState = null

  // difference prevElement and prevRenderedElement: the first one is a user-defined component,
  // -- Smallheader, the latter one is div.
  prevRenderedElement = this.renderedComponent._currentElement
  nextRenderedElement = this.render()

  if(shouldUpdateComponent(prevRenderedElement, nextRenderedElement)){
    Reconciler.receiveComponent(this.renderedComponent, nextElement)
  }else{
    // not the same type, umount directly
    Reconciler.umountComponent(this.renderedComponent)
    nextRenderedComponent = instantiateComponent(nextElement)
    this.renderedNode = Reconciler.mountComponent(nextRenderedComponent)
    DOM.replaceNode(this.renderedComponent._domNode, this.renderedNode)
  }

}
```

Note that we called `updateComponent()` with two same arguments. This is because the change of `state` will not lead to the change of element(`props` will). Then we analyze `updateComponent()`. 

At first we judge what kind of update is -- props or state, by comparing if `prevElement !== nextElement`.

Then we reset the current props and state and we get the new element by `render()`. Let's have a look at the value of `prevRenderedElement` or `nextRenderedElement`.(When we run `index.html` and see Timer makes 0 to 1)

Value of `prevRenderedElement`:
```js
{"type":"div","props":{"children":[{"type":"div","props":{"style":{"fontSize":"36px","color":"red"},"children":"SmallHeader"}},0]}}
```
Value of `nextRenderedElement`:
```js
{"type":"div","props":{"children":[{"type":"div","props":{"style":{"fontSize":"36px","color":"red"},"children":"SmallHeader"}},1]}}
```
Then we go into `shouldUpdateComponent()`. Let's have a look first,

```js
// shouldUpdateComponent.js

function shouldUpdateComponent(prevElement, nextElement){
  return prevElement.type = nextElement.type
}
```

Why comparing type? If you Read [Reconciliation](https://reactjs.org/docs/reconciliation.html) before, you could remember this is what React do:

> Whenever the root elements have different types, React will tear down the old tree and build the new tree from scratch.
> When comparing two React DOM elements of the same type, React looks at the attributes of both, keeps the same underlying DOM node, and only updates the changed attributes.
(And then update DOM children)

So here comes to two cases, when element.type are different, it umount the old component, instatiate the new one and mount it. And when element.type are same, we update DOM children.
We call `receiveComponent()`, which is in `Reconciler`.

```js
// Reconciler.js

function receiveComponent(component, nextElement){
  const prevElement = component._currentElement
  if (prevElement === nextElement) return
  component.updateComponent(prevElement, nextElement)
}
```

In DOMComponent, the real update happened.

```js
// DOMComponent.js

updateComponent(prevElement, nextElement){
  this._currentElement = nextElement
  _updateNodeProperties(prevElement.props, nextElement.props)
  _updateDOMChildren(prevElement.props, nextElement.props)
}
```

Like we have shown `_updateNodeProperties` in the previous blogs. Now we will talk more about `_updateDOMChildren` and this will be the heart of `The diffing Algorithm`.

```js
//DOMComponent.js

_updateDOMChildren(prevProps, nextProps){
  const prevType = typeof prevProps.children
  const nextType = typeof nextProps.children
  assert(prevType === nextType)

  //No child, return
  if (nextType === 'undefined') return
  
  if (nextType === 'string' || nextType === 'number'){
    this._domNode.textContent = nextProps.children
  }else{
    this.updateChildren(nextProps.children)
  }
}
```

Like above, we subsitute the old textContent with the new one if just a text change, or we do a deeper operation -- `updateChildren()`.

We will talk about it in the next blog.
