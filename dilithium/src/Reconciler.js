//component -> node

function mountComponent(component){
	return component.mountComponent()
}

function receiveComponent(component, nextElement){
	const prevElement = component._currentElement
	if (prevElement === nextElement) return
	component.updateComponent(prevElement, nextElement)
}

function unmountComponent(component){
	component.unmountComponent()
}

module.exports = {
	mountComponent,
	unmountComponent,
	receiveComponent,
}