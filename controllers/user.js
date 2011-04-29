/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var userModel = require('../models/user'),
    userForm = require('../forms/user'),
    crypto = require('crypto');

exports.register = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
    fnNext( this.ar.view() );
};

exports.register_post = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
    var r = {}, _t = this;
    var user = new userForm.userRegForm(_t.req.post);
    if(user.isValid()){
        user = user.fieldDatas();
        user.email = user.email.toLowerCase();
        user.password = crypto.createHash('md5').update(user.password).digest("hex");
        delete user.password2;
        user.tickets = [];
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
    }else{
        r.error = user.validErrors;
        fnNext( this.ar.json(r) );
    }
};

exports.login = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }else{
        fnNext( this.ar.view() );
    }
};

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

exports.logout = function(fnNext){
    if(this.req.user){
        userModel.updateById(this.req.user._id.toString(), 
            {$pull: {'tickets': this.req.cookies.ttest} });
            
        userModel.delExpireTickets(this.req.user._id.toString());
    }
    this.res.cookies.clear('ttest', {path:'/'});
    fnNext( this.ar.redirect('/') );
};


