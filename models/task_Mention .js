/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
任务中提及其他人，如果任务中提及多个人，就要插入多行记录。
*/
/*
  `task_id`  '任务Id' ,
  `screen_name` '任务创建者的Id' ,
  'scr_screen_name' '被提及者的Id'
  'is_read' '是否被读'
  created_at
*/

var db = require('./baseModel').db,
    commentModel = require('./task'),
    collectionName = 'task_Mention';

var task_Mention = db.collection(collectionName);
    
db.bind(collectionName, {
	//获取被提及的任务
    getMentionByScreenName: function(screen_name, page, pagesize, fn){
        var _t = this,
        pagesize = Number(pagesize),
        page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        _t.find({scr_screen_name:screen_name}).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, mentions){

            if(err || !mentions || !mentions.length){
                fn && fn(err, mentions);
                return;
            }
            var ids = [];
            for(var i=0, len=mentions.length; i<len; i++){
                ids.push(mentions[i].task_id);
            }
            taskModel.find({_id:{$in: ids}}).toArray(function(err, tasks){
                if(!err && tasks && tasks.length){
                    var taskDict = {};
                    for(var i=0, len=tasks.length; i<len; i++){
                        taskDict[tasks[i]._id.toString()] = tasks[i];
                    }
                    for(var i=0, len=mentions.length; i<len; i++){
                        mentions[i].task = taskDict[mentions[i].task_id.toString()];
                    }
                }
                fn && fn(err, mentions);
            });
        });
    }
});

module.exports = task_Mention;
