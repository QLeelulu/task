/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var forms = n2Mvc.forms;

exports.taskForm = forms.newForm({
    text:{
        required: true,
        required_msg: '任务内容必填'
    }
  , privacy:{
        number: true,
        number_msg: '必须为数字'
    }
  , status:{
        number: true,
        number_msg: '必须为数字'
    }
  , priority:{
        number: true,
        number_msg: '必须为数字'
    }
});
