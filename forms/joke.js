/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var forms = n2Mvc.forms;

exports.jokeForm = forms.newForm({
    content:{
        required: true,
        required_msg: '内容必填'
    },
    title:{}
});
