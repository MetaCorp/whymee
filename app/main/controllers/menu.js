'use strict';
angular.module('main')
    .controller('MenuCtrl', function($state, Auth, Users) {

    var vm = this;

    

    Auth.$requireAuth().then(function(data) {
        var user = data;

        vm.user = Users.getInfos(user.uid);
        vm.notifications = Users.getNotifications(user.uid);
    });

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
