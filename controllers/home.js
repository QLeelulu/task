/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var taskModel = require('../models/task');

exports.index = function(fnNext){
    var _t = this,
        pagesize = 20,
        page = Number(this.req.get.page);
    page = (isNaN(page) || page < 1) ? 1 : page;
    taskModel.find().skip((page-1)*pagesize).limit(pagesize).toArray(function(err, tasks){
        fnNext( _t.ar.view( {tasks:tasks} ) );
    });
};

