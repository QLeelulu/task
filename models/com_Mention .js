/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
评论中提及其他人，如果评论中提及多个人，就要插入多行记录。
*/
/*
  `comment_id`  '评论Id' ,
  `screen_name` '评论者Id' ,
  'scr_screen_name' '被提及者的Id'
  'is_read' '是否被读'
  created_at
*/

var db = require('./baseModel').db,
    commentModel = require('./comment'),
    collectionName = 'com_Mention';

var com_Mention = db.collection(collectionName);
    
db.bind(collectionName, {
	//获取被提及的评论
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
                ids.push(mentions[i].comment_id);
            }
            commentModel.find({_id:{$in: ids}}).toArray(function(err, comments){
                if(!err && comments && comments.length){
                    var commentDict = {};
                    for(var i=0, len=comments.length; i<len; i++){
                        commentDict[comments[i]._id.toString()] = comments[i];
                    }
                    for(var i=0, len=mentions.length; i<len; i++){
                        mentions[i].comment = commentDict[mentions[i].comment_id.toString()];
                    }
                }
                fn && fn(err, mentions);
            });
        });
    }
});

module.exports = com_Mention;
