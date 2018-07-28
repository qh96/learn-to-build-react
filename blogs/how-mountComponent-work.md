# How mountComponent() work

In the last blog we introduce mounting. With mounting, React elements show on the screen. In this part we will talk about a very key function - `mountComponent()`. What is it? It seems like a recursion process, how is that gonna work? How to apply mountComponent() to different Components? That are very important questions and you will have answers after reading this blog. Now let's rock!

## Reconciler

In the last blog we have this block of codes:

```js
//Mount.js

function mount(element, node){
  // At mount, element -> component -> renderedNode
  let component = instantiateComponent(element)
  let renderedNode = Reconciler.mountComponent(component)

  DOM.empty(node)
  DOM.appendChildren(node, renderedNode)
}
```

From that we know there is a reconciler to make mountComponent do reconciliation. What's that mean? Well, in the last blog we talk about different types of components, which are mainly divided into two kinds - DOMComponent and User-defined Component(Composite Component). We need to apply distinct methods towards different types of components. And that's why we use Reconciliation.

We create two Components class - Component(User-defined component) and DOMComponent. In both we append diverse mountComponent() methods with same name - mountComponent(). There is a terminology we called - **Polymorphism**. What we use here is actually a function polimorphism.

In Reconciler.js, we create mountComponent() for Polymorphism.

```js
function mountComponent(component){
  return component.mountComponent()
}
```

## Composite Component

Have a look at Composite Component:

```js
//Component.js

class Component{
  constructor(props){
    this.props = props
    this.renderedComponent = null
    this.renderedNode = null
    this._currentElement = null
    //assert JSX typo
    assert(this.render)
  }

  _construct(element){
    // store the element
    this._currentElement = element
  }

  mountComponent(){
    // mount: element -> component -> Node
    // this.render() is not what we defined in Mount.js,
    // it is in App.js, this wrap JSX
    let renderedElement = this.render() // render here a reference of render() in App.js
    
    let renderedComponent = instantiateComponent(renderedElement)
    this.renderedComponent = renderedComponent // store it

    let renderedNode = Reconciler.mountComponent(renderedComponent) // Recursion
    this.renderedNode = renderedNode

    return renderedNode
  }
}
```
It seems like we don't have much to say. It just standard flow : element -> component -> Node. 

As it said [here](https://reactjs.org/docs/implementation-notes.html#introducing-internal-instances), the composite internal instances need to store:

* The current element.
* The public instance if element type is a class.
* The **single** rendered internal instance. It can be either a DOMComponent or a CompositeComponent.

Now you might know why we use a class rather than a function here - primarily because we need to store those value for reusing.


### Example

We take `render(<App />)` for example. 

The rendered element firstly returned by this.render() is :

```js
{"type":"div","props":{"children":[{"type":"div","props":{"children":[{"type":"h1","props":{"style":{"color":"red"},"children":"Header 1"}},{"props":{}},{"type":"h2","props":{"style":{"color":"blue"},"children":"Header 2"}}]}},{"type":"h3","props":{"children":"Header 3"}}]}}
```

The rendered component firstly after instantiated is:

```js
{"_renderedChildren":null,"_currentElement":{"type":"div","props":{"children":[{"type":"div","props":{"children":[{"type":"h1","props":{"style":{"color":"red"},"children":"Header 1"}},{"props":{}},{"type":"h2","props":{"style":{"color":"blue"},"children":"Header 2"}}]}},{"type":"h3","props":{"children":"Header 3"}}]}},"_domNode":null}
```

The rendered node after mount finally is:

```html
<div><div><h1 style="color: red;">Header 1</h1><h4 style="color: rgb(161, 0, 210);">SmallHeader</h4><h2 style="color: blue;">Header 2</h2></div><h3>Header 3</h3></div>
```

## DOM Component

First let's have a look at DOM Component:

```js
//DOMComponent.js

class DOMComponent extends MultiChild{
  constructor(element){
    super()
    this._currentElement = element
    this._domNode = null
  }

  mountComponent(){
    let node = document.createElement(this._currentElement.type)
    this._domNode = node

    this._updateNodeProperties({}, this._currentElement.props)
    this._createInitialDOMChildren(this._currentElement.props)
    
    return node
  }
```

We see we create a new dom node. After that, there are two main process. We update node's properties and then recursively create initial dom children. Those are a little bit tricky and need to be explain in detail.

First, let's go into `_updateNodeProperties()`:

```js
  _updateNodeProperties(prevProps, nextProps){
    /* 
      * what we do: update old style and set new style
      * the 1st loop: set each old styleName to '', for example
      updateStyles={
        color = ''
        backgroundImage = ''
      }
      just for store the Name(key). Then remove all other properties 
      * the 2nd loop: replace old style in updateStyles with new style and set new property
      
    */
    let updateStyles = {}
    Object.keys(prevProps).forEach((propName) => {
      if (propName === 'style'){
        Object.keys(prevProps['style']).forEach((styleName) => {
          updateStyles[propName] = ''
        })
      }else{
        DOM.removeProperty(this._domNode, propName)
      }
    })

    Object.keys(nextProps).forEach((propName) =>{
      let prevValue = prevProps[propName]
      let nextValue = nextProps[propName]

      if (prevValue === nextValue) return

      if (propName === 'style'){
        Object.keys(nextProps['style']).forEach((styleName) => {
          updateStyles[styleName] = nextProps.style[styleName]
        })
      }else{
        DOM.setProperty(this._domNode, propName, nextProps[propName])
      }

      DOM.updateStyle(this._domNode, updateStyles)
    })
  }
```
About function `updateStyle()`:
```js
function updateStyle(node, updateStyles){
  Object.keys(updateStyles).forEach((styleName) => {
    node.style[styleName] = updateStyles[styleName]
  })
}
```
Simply, we have two loops. What we do is we do mount node's properties. Since it is a mount process, we set prevProps to {}. But here we mentioned a little bit 'update'. In the first loop we set each old styleName to '', for example:
```
updateStyles={
  color = ''
  backgroundImage = ''
}
```
just for store the Name(key) of in object updateStyles, then we remove all other properties.

In the second loop we firstly compared two elements, if they are the same we do a shortcut.
Otherwise we update style by replacing old style in updateStyles with new style and set all new properties.

In the end we do `DOM.updateStyle` to set new style to node based on styles stored in updateStyles().

Now, let's go into a more complex `_createInitialDOMChildren()`:

```js
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

We will talk about this function in the next blog.











