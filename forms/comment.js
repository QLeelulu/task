/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var forms = n2Mvc.forms;

exports.commentForm = forms.newForm({
    text:{
        required: true,
        required_msg: '评论内容必填'
    }
  , task_id:{
        number: true,
        number_msg: '必须为数字'
    }
  , taskschedule_id:{
        number: true,
        number_msg: '必须为数字'
    }
});
