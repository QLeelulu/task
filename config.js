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

exports.MYSQL_HOST = 'localhost';
exports.MYSQL_PORT = 3306;
exports.MYSQL_USER = 'root';
exports.MYSQL_PASSWORD = '123456';
exports.MYSQL_DB_NAME = 'task';

exports.middlewares = [
    'cookie',
    'initUserInfo',
];

exports.init = function(){
    this.route.static('^/favicon.ico');
    this.route.static('^/static/(.*)');
    
    
	this.route.map(
        'userRoute',
        '/u/{domain}/',
        {controller:'user', action:'user_by_domain'},
		{domain:'\\w+'}
    );
	
	this.route.map(
        'userRoute',
        '/n/{screen_name}/',
        {controller:'user', action:'user_by_screen_name'},
		{screen_name:'\\w+'}
    );
	
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