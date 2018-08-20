function shouldUpdateComponent(prevElement, nextElement){
	return prevElement.type = nextElement.type
}

module.exports = shouldUpdateComponent