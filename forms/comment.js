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
        required: true,
        number_msg: '任务ID必填'
    }
  , taskschedule_id:{
        required: true,
        number_msg: '任务进度ID必填'
    }
});
