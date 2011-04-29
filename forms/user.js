/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var forms = n2Mvc.forms;

exports.userRegForm = forms.newForm({
    email:{
        required: true
      , required_msg: 'email必填'
      , email: true
      , email_msg: 'email格式错误'
    },
    password:{
        required: true
      , required_msg: '密码必填'
    },
    password2:{
        required: true
      , required_msg: '密码确认必填'
      , equalto: 'password'
      , equalto_msg: '两次填写的密码不一样'
    }
});
