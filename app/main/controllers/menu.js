'use strict';
angular.module('main')
    .controller('MenuCtrl', function($state, Auth, Users) {

    var vm = this;

    vm.user = null;
    vm.notifications = [];

    vm.chatNotif = [];
    vm.wishNotif = [];
    vm.friendNotif = [];

    Auth.$requireAuth().then(function(data) {
        var user = data;

        vm.user = Users.getInfos(user.uid);
        vm.notifications = Users.getNotifications(user.uid);

        vm.notifications.$watch(function(event) {
            switch(event.event) {
                case 'child_added':
                    Users.getNotif(user.uid, event.key).$loaded(function(data) {
                        parseNotif(data);
                    });
                    break;
                case 'child_changed':
                    console.log('notif changed', event);
                    Users.getNotif(user.uid, event.key).$loaded(function(data) {
                        console.log('data:', data);
                        if (!data.new)
                            removeNotif(data);
                    });
                    break;
            }
        });
    });

    var removeNotif = function(notif) {
        switch(notif.type) {
            case 'wish':
                vm.wishNotif.splice(vm.wishNotif.indexOf(notif), 1);
                break;
            case 'friend':
                vm.friendNotif.splice(vm.friendNotif.indexOf(notif), 1);
                break;
            case 'chat':
                vm.chatNotif.splice(vm.chatNotif.indexOf(notif), 1);
                break;
            default:
                break;
        }
    };

    var parseNotif = function(notif) {
        if (!notif.new) return;

        switch(notif.type) {
            case 'wish':
                vm.wishNotif.push(notif);
                break;
            case 'friend':
                vm.friendNotif.push(notif);
                break;
            case 'chat':
                vm.chatNotif.push(notif);
                break;
            default:
                break;
        }
    };

    vm.logout = function() {
        Auth.unauth();
    };

    vm.goNotif = function(notif) {
        if (notif.type === 'wish')
            $state.go('app.wish', { id: notif.id });
        else if (notif.type === 'chat')
            $state.go('app.chat', { chat: notif.id });

        notif.new = false;

        Users.checkNotif(vm.user.id, notif.$id);
    };

    vm.getUser = function(userId) {
        return Users.getInfos(userId);  
    };
});
