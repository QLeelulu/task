/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    text     : String
  , user_id  : ObjectId
  , privacy  : Number 隐私， 1:私人任务, 999:公开任务
  , status   : Number 状态， 1:默认（未开始，等待）, 500:暂停, 999:开始
  , priority : Number 优先级，1~4
  , comments_count: Number
  , rt_count: Number
  , created_at: Date
  , updated_at: Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    commentModel = require('./comment'),
    collectionName = 'tasks';

var Task = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取用户的任务（包含用户自己的和用户关注的）
     * @param user_id ObjectId: 用户的id
     * @param friend_ids [ObjectId]: 用户的关注列表id
     */
    getUserTasks: function(user_id, friend_ids, page, pagesize, fn){
        var _t = this,
            pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        friend_ids = friend_ids || [];
        friend_ids.push(user_id);
        _t.find({user_id: {$in: friend_ids}}).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, tasks){
            if(err || !tasks || !tasks.length){
                fn && fn(err, tasks);
                return;
            }
            var ids = [];
	    var taskIds = [];
            for(var i=0, len=tasks.length; i<len; i++){
                ids.push(tasks[i].user_id);
		taskIds.push(tasks[i]._id);
            }
	    //获取任务评论次数
	    var count = 0;
	    commentModel.getCommentCount(taskIds, 1, function(retCountDict){
		if(retCountDict){
		    for(var j=0, lenj=tasks.length; j<lenj; j++){
			count = retCountDict[tasks[j]._id.toString()];
			tasks[j].commentCount = count?count:0;
		    }
		}
	    }); 
	    

            userModel.find({_id:{$in: ids}}).toArray(function(err, users){
                if(!err && users && users.length){
                    var userDict = {};
                    for(var i=0, len=users.length; i<len; i++){
                        userDict[users[i]._id.toString()] = users[i];
                    }
                    for(var i=0, len=tasks.length; i<len; i++){
                        tasks[i].user = userDict[tasks[i].user_id.toString()];
                    }
                }
                fn && fn(err, tasks);
            });
        });
    },
    getTasks: function(page, pagesize, fn){
        var _t = this,
            pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        _t.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, tasks){
            if(err || !tasks || !tasks.length){
                fn && fn(err, tasks);
                return;
            }
            var ids = [];
	    var taskIds = [];
            for(var i=0, len=tasks.length; i<len; i++){
                ids.push(tasks[i].user_id);
		taskIds.push(tasks[i]._id);
            }
	    //获取任务评论次数
	    var count = 0;
	    commentModel.getCommentCount(taskIds, 1, function(retCountDict){
		if(retCountDict){
		    for(var j=0, lenj=tasks.length; j<lenj; j++){
			count = retCountDict[tasks[j]._id.toString()];
			tasks[j].commentCount = count?count:0;
		    }
		}
	    }); 

            userModel.find({_id:{$in: ids}}).toArray(function(err, users){
                if(!err && users && users.length){
                    var userDict = {};
                    for(var i=0, len=users.length; i<len; i++){
                        userDict[users[i]._id.toString()] = users[i];
                    }
                    for(var i=0, len=tasks.length; i<len; i++){
                        tasks[i].user = userDict[tasks[i].user_id.toString()];
                    }
                }
                fn && fn(err, tasks);
            });
        });
    }
});

module.exports = Task;
