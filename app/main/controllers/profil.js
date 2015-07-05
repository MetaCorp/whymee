'use strict';
angular.module('main')
    .controller('ProfilCtrl', function($state, $stateParams, user, Users, Chats) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.profil = Users.getInfos($stateParams.id);
    vm.friends = [];
    vm.isFriend = false;
    vm.isPending = false;

    Users.getFriends(user.uid).then(function(data) {
        vm.friends = data;
        if (contains(vm.friends, $stateParams.id))
            vm.isFriend = true; 
    });

    vm.addFriend = function() {
        Users.addPendingFriend($stateParams.id, user.uid);
    };

    // fix chat id1 !== id2
    vm.chat = function() {
        Chats.getOrCreate(user.uid, $stateParams.id).then(function(chatId) {
            console.log('chatId:', chatId);
            $state.go('app.chat', { chat: chatId });
        });
    };

    var contains = function(array, id) {
        if (array === undefined) return false;

        var bool = false;
        for(var i = 0; i < array.length; i++) {
            if (array[i].id === id)
                bool = true;
        }
        return bool;
    };

});