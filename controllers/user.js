/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var userModel = require('../models/user'),
    userForm = require('../forms/user'),
    userAuthFilter = require('../filters/auth').userAuthFilter,
    crypto = require('crypto');

/************
 * 注册
 */
exports.register = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    userModel.getByEmailOrScreenName('sdf', 'qleelulu', function(err, _user){ console.log(_user)});
    fnNext( this.ar.view() );
};

/************
 * 注册表单提交
 */
exports.register_post = function(fnNext){
    if(this.req.user){
        return fnNext( this.ar.redirect('/') );
    }
    
    var r = {error:''}, _t = this;
    var user = new userForm.userRegForm(_t.req.post);
    if(user.isValid()){
        user = user.fieldDatas();
        user.email = user.email.toLowerCase();
        userModel.getByEmailOrScreenName(user.email, user.screen_name, function(err, _user){
            if(err || _user){
                if(err){
                    r.error = '系统错误';
                }else{
                    if( user.screen_name.toLowerCase() == _user.screen_name.toLowerCase() ){
                        r.error = '该昵称已经被注册.\r\n';
                    }
                    if( user.email.toLowerCase() == _user.email.toLowerCase() ){
                        r.error += '该Email已经注册过';
                    }
                }
                return fnNext( _t.ar.json(r) );
            }
            
            user.password = crypto.createHash('md5').update(user.password).digest("hex");
            delete user.password2;
            user.screen_name_lower = user.screen_name.toLowerCase();
            // $push或者$addToSet的时候，如果字段未定义，则会自动作为array来处理，所以这里不用初始化都没关系的
            user.tickets = [];
            user.friends_ids = [];
            user.created_at = user.updated_at = new Date(); //(new Date()).format('yyyy-MM-dd hh:mm:ss');
            userModel.insert(user, 
                function(err, user){
                    if(err){
                        r.error = '更新数据库失败';
                    }else if(user){
                        r.success = true;
                    }else{
                        r.error = '未知错误';
                    }
                    fnNext( _t.ar.json(r) );
                }
            );
        });
    }else{
        r.error = user.validErrors;
        fnNext( this.ar.json(r) );
    }
};

/************
 * 登录
 */
exports.login = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }else{
        fnNext( this.ar.view() );
    }
};

/************
 * 登录表单提交
 */
exports.login_post = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
    var r = {}, _t = this;
    if(!this.req.post.email || 
       !this.req.post.password ){
        r.error = '请填写用户名和密码';
        
        fnNext( this.ar.json(r) );
        return;
    }
    
    userModel.getByEmail(this.req.post.email.trim(), function(err, user){
        if(err){
            r.error = err.message;
        }else if(!user){
            r.error = '用户不存在或者密码错误';
        }else if(crypto.createHash('md5').update(_t.req.post.password.trim()).digest("hex") !== user.password ){
            r.error = '用户不存在或者密码错误';
        }
        if(r.error){
            r.email = _t.req.post.email;
            fnNext( _t.ar.view( r ) );
            return;
        }
        
        var cookieOptions = {path: '/'}, tNow = Date.now(), expires = null;
        if(_t.req.post.remember_me){
            expires = tNow + 30 * 24 * 60 * 60 * 1000;
            cookieOptions.expires = new Date( expires );
        }else{
            expires = tNow + 48 * 60 * 60 * 1000;
        }
        var ticket = crypto.createHash('md5').update(user.email + tNow).digest("hex") + '_' + expires;
        _t.res.cookies.set('ttest', ticket, cookieOptions);
        userModel.updateById(user._id.toString(), {$set: {'last_login': new Date()}, $addToSet: {'tickets': ticket} }, function(err, _user){
            if(err || !_user){
                if(err){
                    console.log(err);
                }
                r.error = '登录失败';
                r.email = _t.req.post.email;
                fnNext( _t.ar.view( r ) );
            }else{
                fnNext( _t.ar.redirect('/') );
            }
            userModel.delExpireTickets(user._id.toString());
        });
    });
};

/************
 * 退出
 */
exports.logout = function(fnNext){
    if(this.req.user){
        userModel.updateById(this.req.user._id.toString(), 
            {$pull: {'tickets': this.req.cookies.ttest} });
            
        userModel.delExpireTickets(this.req.user._id.toString());
    }
    this.res.cookies.clear('ttest', {path:'/'});
    fnNext( this.ar.redirect('/') );
};

/************
 * 根据 screen_name 查看用户首页
 */
exports.user_by_screen_name = function(fnNext){
    var _t = this;
    userModel.getByScreenName(_t.routeData.args.screen_name, function(err, user){
        if(err || !user){
            fnNext(_t.ar.notFound());
        }else{
            var vd = {user:user};
            if(_t.req.user){
                userModel.isFollowed(_t.req.user._id.toString(), user._id.toString(), function(err, isFollowed){
                    vd.isFollowed = isFollowed;
                    fnNext(_t.ar.view(vd, 'user/user_info.html'));
                });
            }else{
                fnNext(_t.ar.view(vd, 'user/user_info.html'));
            }
        }
    });
};

/************
 * 关注、取消关注
 * 参数`1`为关注，`0`为取消关注
 */
exports.follow_control = function(fnNext){
    var _t = this,
        r = {success: false},
        follow = _t.req.post.follow,
        follow_user_id = _t.req.post.follow_user_id;
    if(follow_user_id && follow==='0'){
        userModel.unfollow(_t.req.user._id.toString(), follow_user_id, function(err, user){
            if(err){
                r.error = err.message; 
            }else{
                r.success = true;
            }
            fnNext( _t.ar.json(r) );
        });
    }else if(follow_user_id && follow === '1'){
        userModel.follow(_t.req.user._id.toString(), follow_user_id, function(err, user){
            if(err){
                r.error = err.message; 
            }else{
                r.success = true;
            }
            fnNext( _t.ar.json(r) );
        });
    }else{
        r.error = '参数错误';
        fnNext( _t.ar.json(r) );
    }
};
exports.follow_control.filters = [userAuthFilter];

