const instantiateComponent = require('./instantiateComponent')
const Reconciler = require('./Reconciler')
const DOM = require('./DOM')

function render(element, node){
	//TODO: update
	mount(element, node)
}

function mount(element, node){
	// At mount, element -> component -> renderedNode
	let component = instantiateComponent(element)
	let renderedNode = Reconciler.mountComponent(component)

	DOM.empty(node)
	DOM.appendChildren(node, renderedNode)
}

module.exports = {
	render
}

