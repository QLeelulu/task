/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var events = require("events"), 
    userModel = require('./user');


function getUser(cb){
    userModel.getUserByUsername('qleelulu',function(err, user){
        var i = 0;
        process.nextTick(function(user){
            cb(user);
        });
        console.log('end get user' + i);
        i++;
    });
}

getUser(function(user){
    console.log('end'+user);
});
