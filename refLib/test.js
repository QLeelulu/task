/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require.paths.unshift('./');

var mongo = require('./mongoskin'),
    db = mongo.db('localhost:27017/test_task?auto_reconnect');

var User = db.collection('users'),
	Task = db.collection('tasks');

function initUsers(){
	
	for (var i = 0; i < 20; i++) {
		var user = {
			name: 'QLeelulu'+i,
			friend_ids: []
		};
		User.insert(user, function(){
		});
	}
	
	User.find().toArray(function(err, users){
		if(users){
			var ids = [];
			users.forEach(function(_user){
				User.update({_id: _user._id}, {$set: {friend_ids:ids}}, function(){});
				ids.push(_user._id);
			});
		}
	});

};
//initUsers();

//测试未定义的字段能否正常用$push或者$addToSet来插入值
function testPullUndefineField(){
	User.find().toArray(function(err, users){
		if(users){
			var user = users[2];
			console.dir(user);
			User.update({_id: user._id}, {$push: {testarr: 12}}, function(err, user){
				console.dir(err);
				console.dir(user);
			});
		}
	});
}
//testPullUndefineField();

function getFollows(){
	User.find().toArray(function(err, users){
		if(users){
			User.find({friend_ids: users[15]._id}).toArray(function(err, _users){
				console.log(_users.length);
			});
		}
	});
}
//getFollows();

function initTask(){
	User.find().toArray(function(err, users){
		if(users){
			for (var i = 0; i < 20; i++) {
				var ran = parseInt(Math.random()*19),
					task = {
						text: 'Task content '+i,
						user_id: users[ran]._id
					};
				Task.insert(task, function(){
				});
			}
		}
	});
	
}
//initTask();

function testFind(){
	User.find().toArray(function(err, users){
		if(users){
			var user = users[2];
			var ids = user.friend_ids;
			ids.push(user._id);
			Task.find({user_id: {$in: ids}}).toArray(function(err, tasks){
				console.log('======  tasks for user '+ user.name + '  =======');
				console.dir(tasks);
			});
		}
	});
}
//testFind();
