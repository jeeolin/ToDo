/**
 * Created by Lin on 2017/3/15.
 */
;
(function () {
    'use strict';
    var $form_add_task = $('.add-task')
        , $task_delete_trigger
        , $task_detail
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        ;

    init();

    $form_add_task.on('submit', on_add_task_form_submit);
    $task_detail_mask.on('click', hide_task_detatail);

    function on_add_task_form_submit(e) {
        var new_task = {};
        var $input = $(this).find('input[name=content]');
        /*禁用默认行为*/
        e.preventDefault();
        /*获取新task的值*/
        new_task.content = $input.val();
        /*如果新task的值为空，则直接返回 否则继续执行*/
        if (!new_task.content) return;
        /*console.log('new_task', new_task);*/
        /*存入新task*/
        if (add_task(new_task)) {
            //render_task_list();
            $input.val(null);
        }
    }

    function listen_task_detail() {
        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            show_task_detatail(index);
        })
    }

    /*查看task详情*/
    function show_task_detatail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }

    function updat_task(index, data) {
        if (!index || !task_list[index])return;
        task_list[index] = data;
        refresh_task_list();
    }

    function hide_task_detatail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }


    /*渲染task的详细信息*/
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return;

        var item = task_list[index];
        var tpl = '<form>' +
            '<div class="content">' +
            item.content +
            '</div>' +
            '<div><input style="display: none;" type="text" name="content" value="' + item.content + '"></div>' +
            '<div>' +
            '<div class="desc">' +
            '<textarea name="desc">' + item.desc + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind">' +
            '<input name="remind_data" type="date" value="'+ item.remind_data+'">' +
            '</div>' +
            '<div><button type="submit">更新</button></div>' +
            '</form>';

        $task_detail.html(null);
        $task_detail.html(tpl);
        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input =$update_form.find('[name=content]');

        $task_detail_content.on('dblclick', function () {
                $task_detail_content_input.show();
                $task_detail_content.hide();
        });

        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_data = $(this).find('[name=remind_data]').val();
            //console.log('data',data);
            updat_task(index, data);
            hide_task_detatail();
        })

    }

    /*查找并监控所有的删除按钮的点击事件*/
    function listen_task_delete_trigger() {
        $task_delete_trigger.on('click', function () {
            var $this = $(this);
            /*找到删除按钮所在的task元素*/
            var $item = $this.parent().parent();
            var index = $item.data('index');
            /*确认删除*/
            var tmp = confirm('确定删除？');
            tmp ? delete_task(index) : null;
        })

    }


    function add_task(new_task) {
        /*将新task推入task_list*/
        task_list.push(new_task);
        /*更新localStorage*/
        refresh_task_list();
        return true;
        /*console.log('task_list',task_list);*/
    }

    /*刷新localStorage数据并且渲染模板*/
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    /*删除task_list */
    function delete_task(index) {
        if (!index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
    }

    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length) {
            render_task_list();
        }
    }

    function render_task_list() {
        /*console.log('1',1);*/
        var $task_list = $('.task-list');
        $task_list.html('');
        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i], i);
            $task_list.append($task);
        }
        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');
        listen_task_delete_trigger();
        listen_task_detail();
    }

    /*渲染task模版*/
    function render_task_item(data, index) {
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input type="checkbox"/></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 删除</span>' +
            '<span class="action detail"> 详细</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }

})();