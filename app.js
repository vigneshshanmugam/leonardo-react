/** @jsx React.DOM */

var Project = React.createClass({
  getInitialState: function() {
    return {
			name: "Test Project",
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
			return 	React.DOM[layer.ele_type]({key:i, style: layer.style}, layer.text)
		}
		return (
			<div>  
			<h2>Canvas</h2>
			   <div ref="test" className="final-banner" style={finalBannerStyle}> 
				    {this.state.layers.map(renderLayer)}
				 </div>	
			</div>
		);
	}
});

var Layer = function(name, style, text, ele_type) {
	var default_style = {
		position:"absolute",
		top: "0px",
		left: "0px",
		background: "transparent",
		width: "100%",
		height: "100%" 
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
		var layers = this.state.layers.concat([new Layer("layer "+count, {zIndex:count})]);
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
		layers[index] = layer
		this.setState({layers: layers})
	},
	render:function() {
		var showLayerName = function(layer, i) {
			var click_fn = this.setActiveLayer.bind(this, i);
			return <li style={this.state.activeLayer == layer ? {background:"grey",width:"70px"} : {}} onClick={click_fn} key={i}>{layer.name}</li>
		}
		return (
			<div> 
					<h2>Layers</h2>
					<a href="#" onClick={this.addLayer}>add layer</a>
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
				text: <input type="text" onChange={this.onTextChange}  value={layer.text}/>
				</div>
				<div>
						<br/>
						style:
						<ul>
						   {_.map(layer.style,renderProperty, this)}
						</ul>
				</div>
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
  <Project tools={available_tool_list} width="700" height="200" />,
  document.getElementById('app')
);
