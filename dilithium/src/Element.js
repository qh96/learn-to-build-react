

/* An Element:
	{
		type: 'div'
		props:{
			className : 
			children : []
		}
	}
*/

function createElement(type, config, children){
	// clone config(props), and apply props.children with cases on 1 or more children.
	let props = Object.assign({},config)
	let childCount = arguments.length - 2
	if (childCount > 1){
		props.children = Array.prototype.slice.call(arguments, 2)
	}else if(childCount === 1){
		props.children = children
	}

	return{
		type,
		props
	}
}
module.exports = {
	createElement
}