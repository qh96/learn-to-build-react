# How mountComponent() work

In the last blog we introduce mounting. With mounting, React elements show on the screen. In this part we will talk about a very key function - `mountComponent()`. What it is? It seems like a recursion process, How is that gonna work? How to apply mountComponent() to different Component? That's are very important question which you will have answers after reading this. Now let's rock!

## Reconciler

In the last blog we have this block of codes:

```js
function mount(element, node){
  // At mount, element -> component -> renderedNode
  let component = instantiateComponent(element)
  let renderedNode = Reconciler.mountComponent(component)

  DOM.empty(node)
  DOM.appendChildren(node, renderedNode)
}
```

From that we know there is a reconciler to make mountComponent do reconciliation. What that mean? Well, in the last blog we talk about different types of components, which are mainly divided into two kinds - DOMComponent and User-defined Component(Composite Component). We need to apply distinct methods towards different types of component. And that's why we use Reconciliation.

We create two Components class - Component(User-defined component) and DOMComponent. In both we append diverse mountComponent() methods with same name - mountComponent(). There is a terminology we called - **Polymorphism**. What we use here is actually a function polimorphism.

In Reconciler.js, we create mountComponent() for Polymorphism.

```js
function mountComponent(component){
  return component.mountComponent()
}
```

## Composite Component

We will talk about how Composite Component is mounted. Have a look at Composite Component:

```js
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

The composite internal instances need to store:

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














