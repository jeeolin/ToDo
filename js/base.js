/**
 * Created by Lin on 2017/3/15.
 */
;
(function () {
    'use strict';
    var $form_add_task = $('.add-task')
        , $body = $('body')
        , $window = $(window)
        , task_list = []
        , $task_delete_trigger
        , $task_detail
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        , $checkbox_complete
        , $msg = $('.msg')
        , $msg_content = $msg.find('.msg-content')
        , $msg_confirm = $msg.find('.confired')
        , $alerter = $('.alerter')
        ;

    init();


    function listen_msg_event() {
        $msg_confirm.on('click', function () {
            hide_msg();
        })
    }

    $form_add_task.on('submit', on_add_task_form_submit);
    $task_detail_mask.on('click', hide_task_detatail);

    function pop(arg) {
        if (!arg) {
            console.error('pop title is requered')
        }
        var conf = {};
        var $box,
            $mask,
            $title,
            $content,
            $confirm,
            $cancel,
            dfd,
            confirmed,
            timer
            ;

        dfd= $.Deferred();
        if (typeof arg == 'string')
            conf.title = arg;
        else {
            conf = $.extend(conf, arg);
        }

        $box = $('<div>' +
            '<div class="pop-title">'+ conf.title+'</div>' +
            '<div class="pop-content">' +
            '<div>' +
            '<button style="margin-right: 10px" class="primary confirm">确定</button>' +
            '<button class="primary cancel">取消</button>' +
            '</div>' +
            '</div>' +
            '</div>')
            .css({
                color: '#444',
                width: 300,
                height: 'auto',
                padding:'30px 15px',
                position: 'fixed',
                background: '#fff',
                'border-radius': 3,
                'box-shadow': '0 1px 2px rgba(0,0,0,.5)'
            })

        $title = $box.find('.pop-title').css({
            padding: '5px 10px',
            'font-weight': 900,
            'font-size': 20,
            'text-align': 'center'
        });

        $content = $box.find('.pop-content').css({
            padding: '5px 10px',
            'text-align': 'center'
        });
        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        $mask = $('<div></div>')
            .css({background: 'rgba(0,0,0,.5)',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            });
        timer=setInterval(function(){
            if(confirmed!==undefined){
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }

        },50);
        function on_cancel(){
            confirmed = false;
        }
        $confirm.on('click',function(){
            confirmed = true;
        });
        $cancel.on('click',on_cancel);
        $mask.on('click',on_cancel);

        function dismiss_pop(){
            $mask.remove();
            $box.remove();
        }

        function adjust_box_position() {
            var window_width = $window.width(), window_height = $window.height()
                , box_width = $box.width(), box_height = $box.height()
                , move_x, move_y;
            move_x = (window_width - box_width) / 2;
            move_y = ((window_height - box_height) / 2) - 100;
            $box.css({left: move_x, top: move_y});
//            console.log('window_width,window_height,box_width,box_height', window_width, window_height, box_width, box_height);
        }

        $window.on('resize', function () {
            adjust_box_position();
        });



        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }

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

    /*监听打开task详情*/
    function listen_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = $(this).data('index');
            show_task_detatail(index);
        });
        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detatail(index);
        })
    }

    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            // var is_complete = $this.is(':checked');
            var index = $this.parent().parent().data('index');
            var item = get(index);
            if (item.complete) {
                updat_task(index, {complete: false});
            } else {
                updat_task(index, {complete: true});
            }

        })
    }

    function get(index) {
        return store.get('task_list')[index];
    }

    /*查看task详情*/
    function show_task_detatail(index) {
        /*生成详情模版*/
        render_task_detail(index);
        current_index = index;
        /*显示详情模板*/
        $task_detail.show();
        $task_detail_mask.show();
    }

    /*更新task*/
    function updat_task(index, data) {
        if (!index || !task_list[index])return;
        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
        //console.log('task_list[index]', task_list[index]);
    }

    /*隐藏task详情*/
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
            '<div class="input-item"><input style="display: none;" type="text" name="content" value="' + (item.content || '') + '"></div>' +
            '<div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<label>提醒时间</label>' +
            '<input class="datetime" name="remind_data" type="text" value="' + (item.remind_data || '') + '">' +
            '</div>' +
            '<div class="input-item"><button type="submit">更新</button></div>' +
            '</form>';
        /*清空task详情模板*/
        $task_detail.html(null);
        /*用新模板替换旧模板*/
        $task_detail.html(tpl);
        $('.datetime').datetimepicker();
        /*选中其中的form元素，因为之后会使用其监听submit事件*/
        $update_form = $task_detail.find('form');
        /*选中显示task内容的元素*/
        $task_detail_content = $update_form.find('.content');
        /*选中task input的元素*/
        $task_detail_content_input = $update_form.find('[name=content]');
        /*当内容元素显示input 隐藏自己*/
        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        });

        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            /*获取表单中各个input的值*/
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
            pop('确定删除？')
                .then(function(r){
                    r ? delete_task(index) : null;
                })
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
        listen_msg_event();
        if (task_list.length) {
            render_task_list();
        }
        task_remind_check();
    }

    function task_remind_check() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i);
                var task_timestamp;
                if (!item || !item.remind_data || item.informed)continue;
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_data)).getTime();
                //console.log('current_timestamp,task_timestamp',current_timestamp,task_timestamp);
                if (current_timestamp - task_timestamp >= 1) {
                    updat_task(i, {informed: true});
                    show_msg(item.content);
                }
            }
        }, 300);
    }

    function show_msg(msg) {
        if (!msg) return;
        $msg_content.html(msg);
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg() {
        $msg.hide();
    }

    function render_task_list() {
        /*console.log('1',1);*/
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete)
                complete_items[i] = item;
            else
                var $task = render_task_item(item, i);
            $task_list.prepend($task);
        }
        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');
        $checkbox_complete = $('.task-list .complete[type=checkbox]');
        listen_task_delete_trigger();
        listen_task_detail();
        listen_checkbox_complete();
    }

    /*渲染task模版*/
    function render_task_item(data, index) {
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox"/></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 删除</span>' +
            '<span class="action detail"> 详细</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
})();