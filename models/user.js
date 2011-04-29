/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    screen_name : String
  , domain      : String
  , email       : String
  , password    : String
  , description : String
  , profile_image_url: String
  , gender      : String
  , followers_count: Number
  , friends_count: Number
  , tasks_count: Number
  , follower_ids: [ObjectId]
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
        this.findOne({screen_name: screen_name.toLowerCase()}, function(err, user){
            fn(err, user);
        });
    }
    /*********
     * findOne 不可以只获取部分字段，会返回全部字段，
     * 但是‵tickets‵字段可能很大，
     * 所以使用find
     */
  , getByEmail: function(email, fn){
//        this.findOne({email: email.toLowerCase()}, {'tickets': 0}, function(err, user){
//            console.log(user)
//            fn(err, user);
//        });
        this.find({email: email.toLowerCase()}, {'tickets': 0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  , getByTicket: function(ticket, fn){
//        this.findOne({tickets: ticket}, {'tickets': 0}, function(err, user){
//            console.log(user)
//            fn(err, user);
//        });
        this.find({tickets: ticket}, {'tickets': 0}).limit(1).toArray(function(err, user){
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
});

module.exports = User;
