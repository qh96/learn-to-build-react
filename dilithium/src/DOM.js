function removeProperties(node, attr){
	node.removeAttribute(attr)
}

function setProperty(node, attr, value){
	if (attr === 'children') return
	node.setAttribute(attr, value)
}

function updateStyle(node, updateStyles){
	Object.keys(updateStyles).forEach((styleName) => {
		node.style[styleName] = updateStyles[styleName]
	})
}

function appendChildren(node, children){
	if (Array.isArray(children)){
		children.forEach((child) => node.appendChild(child))
	}else{
		node.appendChild(children)
	}
}
//
function empty(node) {
  [].slice.call(node, node.childNodes).forEach(node.removeChild, node)
}

function removeChild(node, child) {
  node.removeChild(child)
}

function replaceNode(prevNode, newNode){
	const parentNode = prevNode.parentNode
	empty (parentNode)
	parentNode.appendNode(newNode)
}

function insertAfter(node, child, afterChild) {
  node.insertBefore(
    child,
    afterChild ? afterChild.nextSibling : node.firstChild
  )
}

module.exports = {
  replaceNode,
  removeProperties,
  setProperty,
  updateStyle,
  appendChildren,
  empty,
  removeChild,
  insertAfter
}
