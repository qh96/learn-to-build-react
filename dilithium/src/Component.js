const instantiateComponent = require('./instantiateComponent')
const Reconciler = require('./Reconciler')
const assert = require('./Assert')
const shouldUpdateComponent = require('./shouldUpdateComponent')
const DOM = require('./DOM')
//assert

class Component{
  constructor(props){
    this.props = props
    this.renderedComponent = null
    this.renderedNode = null
    this._currentElement = null
    this._pendingState = null
    //assert JSX typo
    assert(this.render)
  }
  setState(partialState){
    this._pendingState = Object.assign({}, this.state, partialState)
    this._performUpdateIfNecessary()
  }
  _construct(element){
    // store the element
    this._currentElement = element
  }

  mountComponent(){
    // mount: element -> component -> Node
    // this.render() is not what we defined in Mount.js,
    // it is in App.js, this wrap JSX
    let renderedElement = this.render()
    
    let renderedComponent = instantiateComponent(renderedElement)
    this.renderedComponent = renderedComponent // store it

    let renderedNode = Reconciler.mountComponent(renderedComponent)
    this.renderedNode = renderedNode

    return renderedNode
  }

  unmountComponent() {
    if (!this.renderedComponent) return
    Reconciler.unmountComponent(this.renderedComponent)
  }

  updateComponent(prevElement, nextElement){
    if (prevElement !== nextElement){
      // Component will be re-rendered because of the changes of props passed down from
      // parents. Here React will call componentWillReceiveProps()
    }
    // re-bookmarking
    this._currentElement = nextElement
    this.props = nextElement.props
    this.state = this._pendingState
    this._pendingState = null

    // difference prevElement and prevRenderedElement: the first one is a user-defined component,
    // -- Smallheader, the latter one is div.
    let prevRenderedElement = this.renderedComponent._currentElement
    let nextRenderedElement = this.render()

    if(shouldUpdateComponent(prevRenderedElement, nextRenderedElement)){
      Reconciler.receiveComponent(this.renderedComponent, nextRenderedElement)
    }else{
      // not the same type, umount directly
      Reconciler.umountComponent(this.renderedComponent)
     const nextRenderedComponent = instantiateComponent(nextElement)
      this.renderedNode = Reconciler.mountComponent(nextRenderedComponent)
      DOM.replaceNode(this.renderedComponent._domNode, this.renderedNode)
    }

  }
  _performUpdateIfNecessary(){
    this.updateComponent(this._currentElement, this._currentElement)
  }
}

module.exports = Component