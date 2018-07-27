const traverseAllChildren = require('./TraverseAllChildren')

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

module.exports = {
	instantiateChildren
}