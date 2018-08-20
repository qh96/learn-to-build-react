const MultiChild = require('./MultiChild')
const DOM = require('./DOM')
const assert = require('./Assert')

class DOMComponent extends MultiChild{
	constructor(element){
		super()
		this._currentElement = element
		this._domNode = null
	}
	// polymorphism
	mountComponent(){
		let node = document.createElement(this._currentElement.type)
		this._domNode = node

		//update style
		this._updateNodeProperties({}, this._currentElement.props)
		this._createInitialDOMChildren(this._currentElement.props)
		
		return node
	}

	unmountComponent() {
    	this.unmountChildren()
  	}

	updateComponent(prevElement, nextElement){
		this._currentElement = nextElement
		this._updateNodeProperties(prevElement.props, nextElement.props)
		this._updateDOMChildren(prevElement.props, nextElement.props)
	}

	_updateDOMChildren(prevProps, nextProps){
		const prevType = typeof prevProps.children
		const nextType = typeof nextProps.children
		assert(prevType === nextType)

		//No child, retun
		if (nextType === 'undefined') return
		
		if (nextType === 'string' || nextType === 'number'){
			this._domNode.textContent = nextProps.children
		}else{
			this.updateChildren(nextProps.children)
		}
	}

	_updateNodeProperties(prevProps, nextProps){
		/* 
			* what we do: update old style and set new style
			* the 1st loop: set each old styleName to '', for example
			updateStyles={
				color = ''
				backgroundImage = ''
			}
			just for store the Name. Then remove all other properties 
			* the 2nd loop: replace old style with new style and add new property
			
		*/
		let updateStyles = {}
		Object.keys(prevProps).forEach((propName) => {
			if (propName === 'style'){
				Object.keys(prevProps['style']).forEach((styleName) => {
					updateStyles[propName] = ''
				})
			}else{
				DOM.removeProperties(this._domNode, propName)
			}
		})

		Object.keys(nextProps).forEach((propName) =>{
			let prevValue = prevProps[propName]
			let nextValue = nextProps[propName]

			if (prevValue === nextValue) return

			if (propName === 'style'){
				Object.keys(nextProps['style']).forEach((styleName) => {
					updateStyles[styleName] = nextProps.style[styleName]
				})
			}else{
				DOM.setProperty(this._domNode, propName, nextProps[propName])
			}

			DOM.updateStyle(this._domNode, updateStyles)
		})
	}

	_createInitialDOMChildren(props){
		/*
			* what we do: we go in to the children of this current DOM node, recursively mount and 
			append those children (and children's children) to the current DOM node.
			* if child node exsits, it can be pure text or more complex node
		*/
		if (typeof props.children === 'string' || typeof props.children === 'number'){
			this._domNode.textContent = props.children
		}else if(props.children){
			const childNodes = this.mountChildren(props.children)
			DOM.appendChildren(this._domNode, childNodes)
		}
	}	
}

module.exports = DOMComponent













