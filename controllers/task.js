/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var taskModel = require('../models/task'),
    userAuthFilter = require('../filters/auth').userAuthFilter,
    taskForm = require('../forms/task').taskForm;

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
        task.created_tat = task.updated_at = new Date();
        taskModel.insert(task, 
            function(err, _task){
                if(err || !_task){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = task.validErrors;
        fnNext( this.ar.json(r) );
    }
};
exports.add_post.filters = [userAuthFilter];