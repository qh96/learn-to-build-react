# How mountComponent() work - Contd

We mentioned `_createInitialDOMChildren` in the last blog. First, let's have a look at the function: 

```js
// DOMComponent.js
  
  _createInitialDOMChildren(props){
    /*
      * what we do: we go in to the children of this current DOM node, recursively mount and 
      append those children (and children's children) to the current DOM node.
      * if child node exsits, it can be pure text or more complex node
    */
    if (typeof props.children === 'string' || typeof props.children === 'number'){
      this._domNode.textContent = props.children
    }else if(props.children){
      const childNodes = this.mountChildren(props.children)
      DOM.appendChildren(this._domNode, childNodes)
    }
  } 
}
```

What we do here is we go into the children of this current DOM node, recursively mount and append those children (and children's children) to the current DOM node. If child node exsits, it can be pure text or more complex node. More specifically, If it is a pure text, we just set current node's child with pure text. If it is not just pure text, we need to call `mountChildren()`

```js
// MultiChild.js

mountChildren(children){
    /*
      what we do: children element -> childrenComponents -> renderedNodes
      childrenComponents with a unique childKey:
        {
          '.0.0': {_currentElement, ...}
          '.0.1': {_currentElement, ...}
        }
      
    */
    let childrenComponents = ChildReconciler.instantiateChildren(children)
    this._renderedChildren = childrenComponents

    // note: this place is map not forEach
    let renderedNodes = Object.keys(childrenComponents).map((childKey) => {
      let childComponent = childrenComponents[childKey]
      return Reconciler.mountComponent(childComponent)
    })
    return renderedNodes
  }
}
```

when it comes to the  `mountChildren()`, you might see there is a key with each child. We do that for update later. And here, we want our children elements to get instantiated first, because this is the preparition for rendering to node. After instantiation, childrenComponents will be like this:

```js
{
  '.0.0': {_currentElement, ...}
  '.0.1': {_currentElement, ...}
}
```

Since we have no idea which kind of children(DOM or user-defind) we wanna to instantiate, we call a ChildReconciler. 

```js
// ChildrenReconciler.js

function instantiateChild(childInstances, child, name){
  const instantiateComponent = require('./instantiateComponent')
  /*
    * this will be used as a callback function in traverAllChildrenImpl().
    * name will be like '.0.0'.
    * here, childInstances is called traverseContext in traverAllChildrenImpl()
    * Initially, childInstances is {}. At here childInstances could be appended new 
    childInstance in it.
    * A single child element at here will be instantiate to a childInstance with a key(name)
  */
  let childComponent = instantiateComponent(child)
  if(!childInstances[name]){
    childInstances[name] = childComponent
  }
}


function instantiateChildren(children){
  // children is an element, refernced in MultiChild
  // element -> component
  let childInstances = {}


  //traverse all children, and childInstances will be renewed.
  traverseAllChildren(children, instantiateChild, childInstances)

  return childInstances
}
```

Oh another `traverseAllChildren()` function!  Looks like we are into a rabbit hole !!!

```js
//TraverseAllChildren.js

function getComponentKey(component, index){
  // This is where we would use the key prop to generate a unique id that
    // persists across moves. However we're skipping that so we'll just use the
    // index.
  // At here component will generate a unique key in base 36( for compactness )
  return index.toString(36)
}

function traverseAllChildren(children, callback, traverseContext){
  return traverseAllChildrenImpl(children, '', callback, traverseContext)
}

function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext){
  // A single child element will be instantiate to a childInstance with a key(name)
  if (typeof children === 'string' || typeof children === 'number' || !Array.isArray(children)){
    callback(traverseContext, children, nameSoFar + SEPARATOR + getComponentKey(children, 0))
    return 1
  }

  let subTreeCount = 0
  const namePrefix = !nameSoFar ? SEPARATOR : SUBSEPARATOR
  children.forEach((child, i) => {
    subTreeCount += traverseAllChildrenImpl(child, namePrefix + getComponentKey(child, i), callback, traverseContext)
  })

  return subTreeCount
}
```

Are you here?? We have got into the last function of the call stack ! 

It seems like the most complex part of `mountComponent()`. Firstly let's make it clear on what we need. We need `childInstance`, which is we will return in `instantiateChildren()`, so what childInstance looks like?

```js
{".0.0":{"_renderedChildren":null,"_currentElement":{"type":"h1","props":{"style":{"color":"red"},"children":"Header 1"}},"_domNode":null},".1.0":{"props":{},"renderedComponent":null,"renderedNode":null,"_currentElement":{"props":{}}},".2.0":{"_renderedChildren":null,"_currentElement":{"type":"h2","props":{"style":{"color":"blue"},"children":"Header 2"}},"_domNode":null}}
```

What we do in traverse is we index each component. We construct name to like '.0.0', '.1.0' stuff like that, and we call foreach to do level-order-traverse of the tree. After reading the childInstance object below, you might wonder why there is not DFS. That's a good question, let me explain it more. There is a recursion in forEach, but not like other serial running language like C, Python... Nothing could stop forEach unless throwing an error. So Actually when we come's into the <div></div> tag in demo/App.js, it does come to recursion to recursively traverse div's children, but meanwhile, <h3></h3> will also being traversed, because forEach would never stopped by recursion here!  

You might caution that there is a `callback()` here, the Exit of `traverseAllChildrenImpl()`. The callback here is the `instantiateChild()` in ChildReconciler.js. When the element is a single one, we call callback(). After callback(), we got childInstances of the current child node!

Then childInstance is returned to mountChildren() and become renderedNode by running `Reconciler.mountComponent(childComponent)` . Then the renderedNode is returned to the original `_createInitialDOMChildren()` and append to the real DOM node.

It is a little big confusing, I know that, because this is something troubles me a lot when I learned this! Maybe I'll draw a flow chart later to explain it more!

OK, Cool! This is the end of mounting. 





