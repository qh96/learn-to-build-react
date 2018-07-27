const Element = require('./src/Element')
const Component = require('./src/Component')
const Mount = require('./src/Mount')

module.exports = {
	createElement : Element.createElement,
	Component,
	render : Mount.render
}