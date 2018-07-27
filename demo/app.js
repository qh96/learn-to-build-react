const Dilithium = require('../dilithium')

class App extends Dilithium.Component{
	render(){
		return(
			<div>
				<div>
					<h1 style={{color:'red'}}>Header 1</h1>
					<SmallHeader />
					<h2 style={{color:'blue'}}>Header 2</h2>
				</div>
				<h3>Header 3</h3>
			</div>
		)
	}
}

class SmallHeader extends Dilithium.Component{
	render(){
		return(
			<h4 style={{color:'#a100d2'}}>SmallHeader</h4>
		)
	}
}

Dilithium.render(<App />,document.getElementById('root'))