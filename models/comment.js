/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
  `task_id` BIGINT NULL COMMENT '任务Id' ,
  `taskschedule_id` BIGINT NULL COMMENT '任务进度Id' ,
  `text` VARCHAR(280) NOT NULL ,
  `user_id` BIGINT NULL COMMENT '评论者Id' ,
  'created_at'
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'comment';

var Comment = db.collection(collectionName);
    
db.bind(collectionName, {
    //获取任务评论及评论用户
    //type : 1代表任务评论，2代表任务进度评论
    getTaskComments: function(task_id, type, page, pagesize, fn){
        var _t = this,
        pagesize = Number(pagesize),
        page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        var where = {task_id: task_id};
	if (type == 2){
	    where = {taskschedule_id: task_id};
	}
        _t.find(where).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, comments){
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
                fn && fn(err, comments);
            });
        });
    },
    //获取任务评论次数
    //type : 1代表任务评论，2代表任务进度评论
    //返回值：{task_id:count,task_id:count,...}
    getCommentCount: function(ids, type, fn){
	var _t = this;
	var key = {task_id:true};
        var where = {task_id: {$in: ids}};
	if(type==2){
	    key = {taskschedule_id:true};
	    where = {taskschedule_id: {$in: ids}};
	}
console.dir(ids);
	_t.group(
	        key,
		where,
		{count: 0},
		function(obj, prev) {prev.count++;prev.task_id=obj.task_id;}
	       , function(err, retCount){
			if(!err && retCount){
			    var retCountDict = {};
console.dir(retCount);		
			    for(var i=0, len=retCount.length; i<len; i++){
				if(type==2){
				    retCountDict[retCount[i].taskschedule_id.toString()] = retCount[i].count;
				}else{
				    retCountDict[retCount[i].task_id.toString()] = retCount[i].count;
				}
			    }
			    fn(retCountDict);
			}
	       });
    }
});

module.exports = Comment;
