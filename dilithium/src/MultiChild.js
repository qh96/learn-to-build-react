const ChildReconciler = require('./ChildReconciler')
const Reconciler = require('./Reconciler')

class MultiChild{
	constructor(){
		this._renderedChildren = null
	}

	mountChildren(children){
		/*
			what we do: children element -> childrenComponents -> renderedNodes
			childrenComponents with a unique childKey:
		    {
		      '.0.0': {_currentElement, ...}
		      '.0.1': {_currentElement, ...}
		    }
			
		*/
		let childrenComponents = ChildReconciler.instantiateChildren(children)
		this._renderedChildren = childrenComponents
		/*	
			childrenComponents:
			{
		      '.0.0': {_currentElement, ...}
		      '.0.1': {_currentElement, ...}
		    }
		*/
		// note: this place is map not forEach
		let renderedNodes = Object.keys(childrenComponents).map((childKey) => {
			let childComponent = childrenComponents[childKey]
			return Reconciler.mountComponent(childComponent)
		})
		return renderedNodes
	}
}

module.exports = MultiChild