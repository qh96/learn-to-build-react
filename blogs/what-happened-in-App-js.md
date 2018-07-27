# What Happened In App.js

When I first got into React, I went to [reactjs.org](reactjs.org) and found the [tic-tac-toe game](https://reactjs.org/tutorial/tutorial.html#what-are-we-building) as a project for beginners. It is a little bit cool, but when I get into the codes, honestly, I see confusion.. Why there are html tags wrapped by `render()` function? How does that work? It seems like **render()** is the start of all.

## Mounting

When we see the `render()` is referenced, you might get curious how it is defined. When you go deeper into the codes you find this:

```js
function render(element, node) {
  assert(Element.isValidElement(element));

  if (isRoot(node)) {
    update(element, node);//We will talk about later
  } else {
    mount(element, node);
  }
}
```

So what is mount? Intuitively, with mounting, DOM trees are shown on the screen. So this is corresponding to what the word "mount" mean, it means initialization. Ok now let's interrupt this "thread" and start a new one:

At here we introduce some very important key words:
* element
* component
* instance

[React Components, Elements, and Instances](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)

### Element

OK, what is element? An **element** is a plain object which describes the structure of the whole DOM tree. It is not a real DOM tree. An element is what `render()` returns, which is immutable. Creating an element is cheap. This is what an element looks like:

```js
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}
```

 An element can contain other elements as a prop. Children here is an array of elements, which is also can be a single element. As a result, it satisfy the needs of recursion.

You still remember this? : In App.js we got html-looking-tags wrapped by `render()`. Since `render()` returns an element, how could this happen? Actually, what we used those html-looking-tags(JSX) is the syntactic sugar of `React.createElement()`. 
```html
<MyButton color="blue" shadowSize={2}>
  Click Me
</MyButton>
```
which can be compiled to:

```js
React.createElement(
  MyButton,
  {color: 'blue', shadowSize: 2},
  'Click Me'
)
```
### Component

And, what is component? A React page is built on **components**. What we used to construct a react page via self-defined like `<Game />` or DOM `<div>` are components. A component can be declared in several different ways:

* DOMComponent: `div`, `ul`, `button`.....
* CompositeComponent: user-defined component, including `functional component` and `class component`
* TextComponent: `number` or `string`

The element can be instantiate to component through:

```js
let component = instantiateComponent(element)

function instantiateComponent(element){
	let componentInstance
	if (typeof element.type === 'function'){
		// class
		componentInstance = new element.type(element.props)
		componentInstance._construct(element) // this._currentElement = element
	}else if (typeof element.type === 'string'){
		// DOM component like 'div'...
		componentInstance = new DOMComponent(element)
	}else if(typeof element === 'string' || typeof element === 'number' ){
		// Text like 'helloworld'...
		componentInstance = new DOMComponent({
			type : 'span',
			props: {
				children : element
			}
		})
	}

	return componentInstance
}
```

### Instance

An `instance` is what you refer `this` to as this in the component class you write. It is useful for storing local state and reacting to the lifecycle events. Note that there is no `this` in functional component. Only class component have instances, but you don't have to create one - React help you do this.

An element is not an actual instance. Compared with Instances, elements are light-weight. So the instance is not very welcomed by React.

### Summary:

Have a look at an classic flow chart written by [@Chang](https://github.com/cyan33/)

![mount-process](mount-process.jpg)

So let's back !! Return to the first question? what is mount?

Have a look at `mount()`:
```js
function mount(element, node){
	// At mount, element -> component -> renderedNode
	let component = instantiateComponent(element)
	let renderedNode = Reconciler.mountComponent(component)//we talk about Reconciler later

	DOM.empty(node)
	DOM.appendChildren(node, renderedNode)
}
```
So `mount()` is a element -> component -> renderedNode process. It get rendered element from `render()` and finally generate real DOM nodes.

In the next blog we will talk about "How mount() works".

















