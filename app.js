/** @jsx React.DOM */

var Project = React.createClass({
  getInitialState: function() {
    return {
			name: "HTML Banners",
		};
  },
  render: function() {
    return (
			<div className="project">
		    	<div className="project-name">{this.state.name}</div>
				<div className="toolset-container">
						<Toolset tools={this.props.tools} />
				</div>
				<div className="canvas-container">
						<DrawingCanvas width={this.props.width} height={this.props.height} />
				</div>
				<div className="layer-manager">
						<LayerManager />
				</div>
				<div className="result">
					<HtmlGenerator />
				</div>			
			</div>
    );
  }
});


var Toolset = React.createClass({
	render:function() {
		     var createTool = function(tool) {
		       return <li> {tool()} </li>;
		     };
		     return (
					 <div>
					 		<h2>Tools</h2>
						 	<ul>{this.props.tools.map(createTool)}</ul>
					 </div>
				 );
	}
})


var DrawingCanvas = React.createClass({
  	getInitialState: function() {
    	return {
			layers: [],
		}
	},
	componentDidMount: function() {
		EventBus.addEventListener("layers_updated", function(event, props, state){
			this.setState({layers:state.layers});
		}, this);
	
	},
	render:function() {
		var finalBannerStyle = {height:this.props.height, width: this.props.width, position:"relative", overflow:"hidden"}
		var renderLayer = function(layer, i) {
			return 	React.DOM[layer.ele_type]({key:i, className: "draggable", style: layer.style}, layer.text)
		}
		return (
			<div>  
			<h2>Canvas</h2>
			   <div ref="test" id="dragContainer" className="final-banner" style={finalBannerStyle}> 
				    {this.state.layers.map(renderLayer)}
				 </div>	
			</div>
		);
	}
});

var Layer = function(name, style, text, ele_type) {
	var default_style = {
		position:"absolute",
		fontSize:"20px",
		fontFamily:"arial, serif",
		top: "0px",
		left: "0px",
		background: "transparent",
		width: "300px",
		height: "100px",
		border: "1px solid blue"
	}
	this.name = name;
	this.style = _.extend({}, default_style, style)
	this.text =  text || name || "";
	this.ele_type = ele_type || "div";
}


var LayerManager = React.createClass({
  getInitialState: function() {
    return {
			layers: [],
			activeLayer:null
		}
	},
	addLayer: function(e) {
		
		 e.preventDefault();
		var count = this.state.layers.length + 1;
		var layers = this.state.layers.concat([new Layer("layer "+count, {zIndex:count,cursor:"move"})]);
		this.setState({layers: layers});
	},
	componentWillUpdate: function(nextProps, nextState) {
	   EventBus.dispatch("layers_updated", this, nextProps, nextState );	
  },
	setActiveLayer: function(index) {
		console.log("clicked", index);
		var layer = this.state.layers[index];
		this.setState({"activeLayer":layer, "activeLayerIndex": index});
	},
	editLayer: function(index, layer) {
		var layers = this.state.layers;
		layers[index] = layer;
		this.setState({layers: layers})
	},
	removeLayer: function(index){
		var layer = this.state.layers[index];
		console.log("Removed " + layer.name);
		 this.state.layers.splice(index,1);
	},
	render:function() {
		var showLayerName = function(layer, i) {
			var click_fn = this.setActiveLayer.bind(this, i);
			return <li style={this.state.activeLayer == layer ? {background:"grey",width:"150px"} : {}} onClick={click_fn} key={i}>{layer.name} - 
						<a href="#" onClick={this.removeLayer.bind(this,i)}> Remove</a>
				   </li>
		}
		return (
			<div> 
					<h2>Layers</h2>
					<button onClick={this.addLayer}>Add layer</button>
					<ul>
						{this.state.layers.map(showLayerName, this)}
					</ul>
					{this.state.activeLayer? <LayerEditor initialLayer={this.state.activeLayer} onChange={this.editLayer.bind(this, this.activeLayerIndex)} /> : ""}
			</div>
		);
	}
})

var LayerEditor = React.createClass({
	getInitialState: function() {
		return {
				layer : this.props.initialLayer	
		}
	},
	onChange:function() {
		this.props.onChange(null, this.state.layer)
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({layer: nextProps.initialLayer});
		console.log("props", nextProps)
	},
	onTextChange:function(e){
		var layer = this.state.layer;
		layer.text = e.target.value;
		this.setState({layer: layer}, this.onChange.bind(this));
	},
	onStylePropChange: function(key, e){
		var layer= this.state.layer;
		layer.style[key] =  e.target.value;
		this.setState({layer: layer}, this.onChange.bind(this));
	},
	render: function() {
		var layer = this.state.layer;
		var renderProperty = function(value, key) {
			return <li> {key} : {' '} <input type="text" onChange={this.onStylePropChange.bind(this, key)} value={value} /> </li>
		}
		return (
			<div>
				---
			   Editing {' '}	{layer.name}
				---
				<div>
				Text : <input type="text" onChange={this.onTextChange}  value={layer.text}/>
				</div>
				<div>
						<br/>
						Style Properties:
						<ul>
						   {_.map(layer.style,renderProperty, this)}
						</ul>
				</div>
			</div>
		);
	}
});

var HtmlGenerator = React.createClass({
	render: function(){
		return (
			<div>
				<h2> HTML Content </h2>
				<div className="html-result"></div>
			</div>
		);
	}
});

var PaintBucketTool = React.createClass({
	render:function() {
		return (
			<div>paint bucket tool</div>
		);
	}
})


var TextTool = React.createClass({
	render:function() {
		return (
			<div>Text tool</div>
		);
	}
})

var MoveTool = React.createClass({
	render:function() {
		return (
			<div>move tool</div>
		);
	}
})




var available_tool_list = []
React.renderComponent(
  <Project tools={available_tool_list} width="730" height="300" />,
  document.getElementById('app')
);
