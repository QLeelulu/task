/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
  `task_id` BIGINT NULL COMMENT '任务Id' ,
  `taskschedule_id` BIGINT NULL COMMENT '任务进度Id' ,
  `content` VARCHAR(280) NOT NULL ,
  `user_id` BIGINT NULL COMMENT '评论者Id' ,
  'created_at'
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'comment';

var Comment = db.collection(collectionName);
    
db.bind(collectionName, {
    //获取任务评论及评论用户
    getTaskComments: function(task, page, pagesize, fn){
        var _t = this,
        pagesize = Number(pagesize),
        page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        _t.find({task_id: task._id},{taskschedule_id:-1}).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, comments){
            if(err || !comments || !comments.length){
                fn && fn(err, comments);
                return;
            }
            var ids = [];
            for(var i=0, len=comments.length; i<len; i++){
                ids.push(comments[i].user_id);
            }
            userModel.find({_id:{$in: ids}}).toArray(function(err, users){
                if(!err && users && users.length){
                    var userDict = {};
                    for(var i=0, len=users.length; i<len; i++){
                        userDict[users[i]._id.toString()] = users[i];
                    }
                    for(var i=0, len=comments.length; i<len; i++){
                        comments[i].user = userDict[comments[i].user_id.toString()];
                    }
                }
		task.comments = comments;
                fn && fn(err, comments);
            });
        });
    },
    //获取任务进度的评论
    getTaskScheduleComments: function(taskSchedule, page, pagesize, fn){
        var _t = this,
        pagesize = Number(pagesize),
        page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        _t.find({taskschedule_id: taskSchedule._id},{task_id:-1}).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, comments){
            if(err || !comments || !comments.length){
                fn && fn(err, comments);
                return;
            }
            var ids = [];
            for(var i=0, len=comments.length; i<len; i++){
                ids.push(comments[i].user_id);
            }
            userModel.find({_id:{$in: ids}}).toArray(function(err, users){
                if(!err && users && users.length){
                    var userDict = {};
                    for(var i=0, len=users.length; i<len; i++){
                        userDict[users[i]._id.toString()] = users[i];
                    }
                    for(var i=0, len=comments.length; i<len; i++){
                        comments[i].user = userDict[comments[i].user_id.toString()];
                    }
                }
		taskSchedule.comments = comments;
                fn && fn(err, comments);
            });
        });
    }
});

module.exports = Comment;
