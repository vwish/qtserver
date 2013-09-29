/** @jsx React.DOM */
var socket = io.connect();
console.log("socket is defined");
var game = {};

var Player = React.createClass({
	render: function(){
		return (
			<div>
				<p></p>
				<p>{this.props.player.name}</p>
				<p>{this.props.player.score}</p>
			</div>
		)
	}
})


var GameComponent = React.createClass({
	getInitialState: function(){
		return {
	        title:null
	        , round:0
	        , correctAnswer:null
	        , answers:[]
	        , now:0
	        , state:"ended"
	        , players:[]
	        , begin:0
	        , end:1
	        , winner:{}
	        , count:null
	        , alert:null
    	}
	},
	componentDidMount: function(){
		var self = this
		socket.on("game", function(data){
			console.log("game", data);
			self.setState(data);
		})

		socket.on('alert', function (data) {
			console.log("socket alert", data)
			self.state.alert = data
		});
	},
	render: function(){
		var players = this.state.players.map(function(player) {
			return (<Player player={player} />);
		})

		var next = (this.state.state == 'ended') ? <button id="begin-btn" class="btn btn-large btn-primary">Next</button> : <div class="div-info alert alert-info">This question is worth {percent*10} points.</div>;
		var answer = (this.state.state == 'ended') ? <div class="div-info alert alert-info"> {this.state.correctAnswer}</div> : "";
		var alert =  (this.state.alert) ? <div class="alert alert-dismissable alert-danger"> {this.state.alert}</div> : "";
		var timestamp = new Date().getTime();
		var timestamp_diff = timestamp - this.state.now;
		if(timestamp < this.state.end){
			percent = parseInt((this.state.end - timestamp) / (this.state.end-this.state.begin) * 100);
			if(percent > 100) percent = 100;
		} else {
			percent = 0;
		}
		var barStyle = {width:percent + "%"};
		return (
			<div>
				<div class="progress progress-striped" id="timer">
				  	<div class="progress-bar progress-bar-info" style={barStyle}></div>
				</div>
				<div class="timebar bar" >
				    	<i class="glyphicon-time glyphicon-white"></i>{percent*10}
				  	</div>
				
				<div class="jumbotron">
					<h1>
						Question {this.state.round}
					</h1>
					<p class="title">
						{this.state.title}
					</p>
					{answer}
				</div>
				{next}
				{alert}
				
				<div class="answers">
					<a class="btn btn-block btn-large btn-primary answer-btn">{this.state.answers[0]}</a>
					<a class="btn btn-block btn-large btn-danger answer-btn">{this.state.answers[1]}</a>
					<a class="btn btn-block btn-large btn-warning answer-btn">{this.state.answers[2]}</a>
					<a class="btn btn-block btn-large btn-success answer-btn">{this.state.answers[3]}</a>
				</div>
				{players}
			</div>
        );
	}
});

// var Answer = React.createClass({
// 	render: function(){
// 		return <a class="btn btn-block btn-large btn-primary answer">{this.props.answer}</a>
// 	}
// });


// The clock
setInterval(function() {
        React.renderComponent(
          GameComponent({timestamp: new Date().getTime()}),
          document.getElementById('question-panel')
        );
      }, 50);

(function($, undefined){
  $(document).ready(function(){
  	React.renderComponent(<GameComponent />, $("#question-panel")[0]);
  	console.log("preparing for sockets");
    
    socket.emit('join', function(playerObj){
    	console.log("emitted join", playerObj)
    	$(".username").text(playerObj.name)
    });
    
    $('.answer-btn').click(function(){
		var val = $(this).text();
		console.log("answering", val)
		if(val !== ''){
			// console.log('test');
			socket.emit('answer', val);
		}
    });

    //Username update
    $('.update-name').click(function(){
    	// var val = $('#username-input').val();
    	var val = prompt("What is your name?")
		if(!val) return;
    	$('.username').text(val)
    	if(val !== ''){
        	socket.emit('name', val, function(err, res){
        	});
      	}
    });

    $("#begin-btn").click(function(){
    	console.log("click")
    	socket.emit("state", "prep", function(err, res){

    	})
    	return false;
    });

  });

})(jQuery);