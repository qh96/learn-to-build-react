const SEPARATOR = '.'
const SUBSEPARATOR = ':'

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

module.exports = traverseAllChildren