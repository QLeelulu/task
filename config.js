/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.DEBUG = true;

exports.projectDir = __dirname;

exports.staticFileDir = 'static';

//require('mongoose').connect('mongodb://localhost/net4_task');
/*******
 * DATABASE
 */
exports.MONGO_HOST = 'localhost';
exports.MONGO_PORT = 27017;
exports.MONGO_DB_NAME = 'node-mongo-task';

exports.middlewares = [
    'cookie',
    'initUserInfo',
];

exports.init = function(){
    this.route.static('^/favicon.ico');
    this.route.static('^/static/(.*)');
    
    this.route.map(
        'idRoute',
        '/{controller}/{action}/{id}/',
        {controller:'home', action:'index'},
        {id:'\\d+'}
    );
    
    this.route.map(
        'default',
        '/{controller}/{action}/',
        {controller:'home', action:'index'}
    );
};