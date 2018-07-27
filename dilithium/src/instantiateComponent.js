const DOMComponent = require('./DOMComponent')

// Element -> Component

/*
	what element could be?
	* class
	* functional component (not supported)
	* DOM component like 'div', 'span'...
	* Text Content like 'helloworld' or number 1

	so what we do : we make a special instance to the selected element, so after that
	we could do operations using things stored in the Component class. 
*/

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

module.exports = instantiateComponent