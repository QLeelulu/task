/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    text     : String
  , privacy  : Number 隐私， 1:私人任务, 999:公开任务
  , status   : Number 状态， 1:默认（未开始，等待）, 500:暂停, 999:开始
  , priority : Number 优先级，1~4
  , comments_count: Number
  , rt_count: Number
  , created_at: Date
  , updated_at: Date
*/

var db = require('./baseModel').db,
    collectionName = 'tasks';

var Task = db.collection(collectionName);
    
db.bind(collectionName, {});

module.exports = Task;
