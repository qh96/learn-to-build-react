function assert(condition){
	if (!Boolean(condition)){
		throw new Error('assertion failure')
	}
}

module.exports = assert