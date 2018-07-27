const instantiateComponent = require('./instantiateComponent')
const Reconciler = require('./Reconciler')
const assert = require('./Assert')
//assert

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
		let renderedElement = this.render()
		
		let renderedComponent = instantiateComponent(renderedElement)
		this.renderedComponent = renderedComponent // store it

		let renderedNode = Reconciler.mountComponent(renderedComponent)
		this.renderedNode = renderedNode

		return renderedNode
	}
}

module.exports = Component