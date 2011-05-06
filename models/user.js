/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    screen_name : String
  , screen_name_lower : String, screen_name小写形式，主要用于查找的时候不区分大小写（其实可以用正则来查找的，但是担心效率会受影响）
  , domain      : String
  , email       : String
  , password    : String
  , description : String
  , profile_image_url: String
  , gender      : String
  , followers_count: Number
  , friends_count: Number
  , tasks_count: Number
  , friends_ids: [ObjectId]
  , created_at: Date
  , updated_at: Date
  , last_login: Date
  , tickets: [] //用户登录的票据，格式为 md5(email + timestdmp) + '_' + timestamp ,最后一个timestamp用于过期时间判断
*/

var db = require('./baseModel').db,
    collectionName = 'task_users';

var User = db.collection(collectionName)
    //UserTicket = db.createCollection('user_tickets', {'capped':true, 'size':1024*1000}, function(err, collection){ });

db.bind(collectionName, {
    getByScreenName: function(screen_name, fn){
        this.findOne({screen_name_lower: screen_name.toLowerCase()}, function(err, user){
            fn(err, user);
        });
    }
    /*********
     * 根据Email或者screen_name来获取用户信息
     */
  , getByEmailOrScreenName: function(email, screen_name, fn){
        this.find({ $or: [ {email: email.toLowerCase()}, {screen_name_lower: screen_name.toLowerCase()} ] }, {'tickets': 0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  , getByEmail: function(email, fn){
//        this.findOne({email: email.toLowerCase()}, {'tickets': 0}, function(err, user){
//            console.log(user)
//            fn(err, user);
//        });
        this.find({email: email.toLowerCase()}, {'tickets': 0, 'screen_name_lower':0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  , getByTicket: function(ticket, fn){
//        this.findOne({tickets: ticket}, {'tickets': 0}, function(err, user){
//            console.log(user)
//            fn(err, user);
//        });
        this.find({tickets: ticket}, {'tickets': 0, 'screen_name_lower': 0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  /**********
   * 将已经过期的登录票据删除(在登录成功或者退出的时候执行)
   * @param user_id {String}
   */
  , delExpireTickets: function(user_id, fn){
        var _t = this;
        _t.findById(user_id, function(err, user){
            if(!err && user){
                var exTime = null, tNow = Date.now();
                for(var i in user.tickets){
                    exTime = Number(user.tickets[i].split('_')[1]);
                    if(tNow >= exTime){
                        _t.updateById(user_id, {$pull: {'tickets': user.tickets[i]} });
                    }
                }
            }
        });
    }
    /***********
     * 增加或者减少任务数（在增加任务或者删除任务的时候调用）
     */
  , addTaskCount: function(user_id, addCount, fn){
        this.updateById(user_id.toString(), {$inc: {'tasks_count': addCount||0} }, function(err, user){
            fn && fn(err, user);
        });
    }
    /*********
     * 检查是否已经关注某个用户
     * @param user_id {String}: 操作的用户id
     * @param follow_user_id {String}: 要关注的用户id
     * @return fn(err, isFollow)
     */
  , isFollowed: function(user_id, follow_user_id, fn){
        this.find({_id: this.id(user_id), friends_ids: this.id(follow_user_id)}, {'_id':1}).limit(1).toArray(function(err, user){
            if(err){
                return fn && fn(err);
            }
            fn && fn(err, user && user.length);
        });
    }
    /****************
     * 关注用户
     * @param user_id {String}: 操作的用户id
     * @param follow_user_id {String}: 要关注的用户id
     */
  , follow: function(user_id, follow_user_id, fn){
        var _t = this;
        this.isFollowed(user_id, follow_user_id,function(err, isFollowed){
            if(err){
                return fn && fn(err);
            }
            if(isFollowed){
                return fn && fn(new Error('has followed')); 
            }
            _t.updateById(user_id.toString(), 
                            {$addToSet: {friends_ids: _t.id(follow_user_id)}, $inc: {'friends_count': 1} }, 
                            function(err, user){
                                if(!err){
                                    _t.updateById(follow_user_id.toString(), {$inc: {'followers_count': 1}}, function(){});
                                }
                                fn && fn(err, user);
                            }
            );
        });
    }
      /****************
     * 取消关注用户
     * @param user_id {String}: 操作的用户id
     * @param unfollow_user_id {String}: 要取消关注的用户id
     */
  , unfollow: function(user_id, unfollow_user_id, fn){
        var _t = this;
        this.isFollowed(user_id, unfollow_user_id, function(err, isFollowed){
            if(err){
                return fn && fn(err);
            }
            if(!isFollowed){
                return fn && fn(new Error('not follow')); 
            }
            _t.updateById(user_id.toString(), 
                            {$pull: {friends_ids: _t.id(unfollow_user_id)}, $inc: {'friends_count': -1} }, 
                            function(err, user){
                                if(!err){
                                    _t.updateById(unfollow_user_id.toString(), {$inc: {'followers_count': -1}}, function(){});
                                }
                                fn && fn(err, user);
                            }
            );
        });
    }
});

module.exports = User;
