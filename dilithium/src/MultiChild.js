const ChildReconciler = require('./ChildReconciler')
const Reconciler = require('./Reconciler')
const { UPDATE_TYPES, OPERATIONS } = require('./operations')
const traverseAllChildren = require('./traverseAllChildren')
const DOM = require('./DOM')

function flattenChildren(children) {
  const flattenedChildren = {}
  traverseAllChildren(
    children,
    (context, child, name) => context[name] = child,
    flattenedChildren
  )
  return flattenedChildren
}

// actual update
function processQueue(parentNode, updates) {
  updates.forEach(update => {
    switch (update.type) {
      case UPDATE_TYPES.INSERT:
        DOM.insertAfter(parentNode, update.content, update.afterNode)
        break

      case UPDATE_TYPES.MOVE:
        // this automatically removes and inserts the new child
        DOM.insertAfter(
          parentNode,
          update.content,
          update.afterNode
        )
        break

      case UPDATE_TYPES.REMOVE:
        DOM.removeChild(parentNode, update.fromNode)
        break

      default:
        assert(false)
    }
  })
}
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

    unmountChildren() {
      ChildReconciler.unmountChildren(this._renderedChildren)
    }

    updateChildren(nextChildren){
        let prevRenderedChildren = this._renderedChildren
        let nextRenderedChildren = flattenChildren(nextChildren)
        
        let mountNodes = []
        let removedNodes = {}
        
        ChildReconciler.updateChildren(
          prevRenderedChildren,
          nextRenderedChildren,
          mountNodes,
          removedNodes
        )
        
        let updates = []
        let lastIndex = 0
        let nextMountIndex = 0
        let lastPlacedNode = null

        Object.keys(nextRenderedChildren).forEach((childKey, nextIndex) => {
          let prevChild = prevRenderedChildren[childKey]
          let nextChild = nextRenderedChildren[childKey]
          if (prevChild === nextChild) {
            if (prevChild._mountIndex < lastIndex) {
              updates.push(OPERATIONS.move(nextChild, lastPlacedNode))
            }

            lastIndex = Math.max(prevChild._mountIndex, lastIndex)
            prevChild._mountIndex = nextIndex
          } else {

            if (prevChild) {
              lastIndex = Math.max(prevChild._mountIndex, lastIndex)
            }
            nextChild._mountIndex = nextIndex
            updates.push(
              OPERATIONS.insert(
                mountNodes[nextMountIndex],
                lastPlacedNode
              )
            )
            nextMountIndex ++
          }
          lastPlacedNode = nextChild._domNode
        })

        Object.keys(removedNodes).forEach((childKey) =>  {
          updates.push(
            OPERATIONS.remove(removedNodes[childKey])
          )
        })

        processQueue(this._domNode, updates)

        this._renderedChildren = nextRenderedChildren
        }
}

module.exports = MultiChild