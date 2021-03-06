let socketIO = require('socket.io');
const battle = require('../controlers/socket/battlecontrol.js')

function socket(server) {
	let io = socketIO(server);

	io.on('connection', function(socketcontrol) {
		console.log('is conect');
		socketcontrol.emit('test', {
			status: '200',
			result: 'conected'
		}, function(response) {
			console.log("delivered", response);
		});

		// socket.on('', () => {...});

		socketcontrol.broadcast.emit('welcome', `user  connected!`);

		socketcontrol.on('error', (err) => { console.log(data) })
        socketcontrol.on('message', (data) => { console.log(data) })
        socketcontrol.on('initbattle', (data) => {
				battle.initbattle(socketcontrol,data).catch((err)=>{
					console.log(err);
				})
		})
		socketcontrol.on('kick', (data) => { battle.kick(socketcontrol,data) })

		// routers
	});

}


module.exports = socket;
