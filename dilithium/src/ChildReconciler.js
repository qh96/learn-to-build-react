const traverseAllChildren = require('./TraverseAllChildren')
const shouldUpdateComponent = require('./shouldUpdateComponent')
const Reconciler = require('./Reconciler')
/*
	{
      '.0.0': {_currentElement, ...}
      '.0.1': {_currentElement, ...}
    }
*/

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

function unmountChildren(renderedChildren) {
  if (!renderedChildren)  return

  Object.keys(renderedChildren).forEach(childKey => {
    Reconciler.unmountComponent(renderedChildren[childKey])
  })
}

function updateChildren(
	prevChildren, // instance tree
	nextChildren, // element tree
	mountNodes, removeNodes){
	const instantiateComponent = require('./instantiateComponent')
	Object.keys(nextChildren).forEach((childKey) => {
		const prevChildComponent = prevChildren[childKey]
		const prevElement = prevChildComponent && prevChildComponent._currentElement
		const nextElement = nextChildren[childKey]

		// three scenarios

		if (prevElement && shouldUpdateComponent(prevElement, nextElement)){
			Reconciler.receiveComponent(prevChildComponent, nextElement)
			nextChildren[childKey] = prevChildComponent
		}else{
			if (prevChildComponent){
				removeNodes[childKey] = prevChildComponent._domNode
				Reconciler.unmountComponent(prevChildComponent)
			}
			const nextChildComponent = instantiateComponent(nextElement)
			nextChildren[childKey] = nextChildComponent
			mountNodes.push(Reconciler.mountComponent(nextChildComponent))
		}
	})

	Object.keys(prevChildren).forEach((childKey)=>{
		if (!nextChildren.hasOwnProperty(childKey)){
			const prevChildComponent = prevChildren[childKey]
			removeNodes[childKey] = prevChildComponent
			Reconciler.unmountComponent(prevChildComponent)
		}
	})

}

module.exports = {
  instantiateChildren,
  unmountChildren,
  updateChildren,
}