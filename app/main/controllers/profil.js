'use strict';
angular.module('main')// TODO message pear to pear doublon
    .controller('ProfilCtrl', function($state, $stateParams, user, Users, Chats) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.profil = Users.getInfos($stateParams.id);
    vm.friends = [];
    vm.pendings = [];

    vm.state = $stateParams.id === user.uid ? 'owner' : 'none';

    Users.getFriends(user.uid).then(function(data) {
        vm.friends = data;
        console.log('vm.friends:', vm.friends);
        if (contains(vm.friends, $stateParams.id))
            vm.state = 'friend'; 
    });

    Users.getPendingFriends(user.uid).then(function(data) {
        vm.pendings = data;
        if (contains(vm.pendings, $stateParams.id))
            vm.state = 'asking';
    });

    Users.getPendingFriends($stateParams.id).then(function(data) {
        vm.pendings = data;
        if (contains(vm.pendings, user.uid))
            vm.state = 'pending';
    });

    vm.addFriend = function() {
        Users.addPendingFriend($stateParams.id, user.uid);
        vm.state = 'pending';
    };

    vm.unPendingFriend = function() {
        Users.removePendingFriend($stateParams.id, user.uid);
        vm.state = 'none';
    };
    
    vm.confirmFriend = function() {
        Users.addFriend($stateParams.id, user.uid);
        Users.confirmFriend(user.uid, $stateParams.id);
        vm.state = 'friend';
    };

    // FIXME chat id1 !== id2
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