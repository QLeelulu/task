/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var taskModel = require('../models/task'),
    userModel = require('../models/user'),
    db = require('../models/baseModel').db,
    userAuthFilter = require('../filters/auth').userAuthFilter,
    taskForm = require('../forms/task').taskForm,
    commentModel = require('../models/comment'),
    commentForm = require('../forms/comment').commentForm;


exports.show = function(fnNext){
    var _t = this, taskId = this.routeData.args.id;
    
    taskModel.findById(taskId, function(err, task){
        fnNext( _t.ar.view({task:task}) );
    });
};


exports.add_post = function(fnNext){
    var _t = this,
        r = {};
    var task = new taskForm(_t.req.post);
    if(task.isValid()){
        task = task.fieldDatas();
        task.created_at = task.updated_at = new Date();
        task.user_id = _t.req.user._id;
        //task.user = new db.db.bson_serializer.DBRef(userModel.collectionName, _t.req.user._id);
        taskModel.insert(task, 
            function(err, _task){
                if(err || !_task){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                    userModel.addTaskCount(_t.req.user._id, 1);
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = task.validErrors;
        fnNext( this.ar.json(r) );
    }
};

exports.add_comment_post = function(fnNext){
    var _t = this,
    r = {};
    var comment = new commentForm(_t.req.post);
    if(comment.isValid()){
        comment = comment.fieldDatas();
        comment.created_at = new Date();
        comment.user_id = _t.req.user._id;
        commentModel.insert(comment, 
            function(err, _comment){
                if(err || !_comment){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                    //添加任务的评论次数
                    //taskModel.addCommentCount(comment.task_id, 1);
                    //添加任务进度的评论次数
                    //if(!comment.taskschedule_id && comment.taskschedule_id > 0){
                        //taskModel.addCommentCount(comment.taskschedule_id, 1);
                    //}
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = comment.validErrors;
        fnNext( this.ar.json(r) );
    }
};

exports.add_post.filters = [userAuthFilter];
