/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var userModel = require('../models/user'),
    taskModel = require('../models/task');

exports.index = function(fnNext){
    if(this.req.user){
        // 或者应该直接跳转到用户的首页？
        showLoginedIndex(this, fnNext);
    }else{
        showNotLoginIndex(this, fnNext);
    }
};

/******
 * 登录用户显示的首页
 */
function showLoginedIndex(ctx, fnNext){
    var _t = ctx,
        pagesize = 20,
        page = _t.req.get.page;
    taskModel.getUserTasks(_t.req.user._id, _t.req.user.friends_ids, page, pagesize,
        function(err, tasks){
            fnNext( _t.ar.view( {tasks:tasks} ) );
        }
    );
}

/*****
 * 未登录用户显示的首页
 */
function showNotLoginIndex(ctx, fnNext){
    var _t = ctx,
        pagesize = 20,
        page = _t.req.get.page;
    taskModel.getTasks(page, pagesize,function(err, tasks){
            fnNext( _t.ar.view( {tasks:tasks} ) );
    });
}
