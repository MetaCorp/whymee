'use strict';
angular.module('main')
    .controller('FriendsCtrl', function($state, user, Users) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);

    vm.friends = [];
    vm.pendingFriends = [];

    Users.getFriends(user.uid).then(function(data) {
        console.log('data:', data);
        vm.friends = data;
    });

    Users.getPendingFriends(user.uid).then(function(data) {
        console.log('data:', data);
        vm.pendingFriends = data;
    });

    vm.selectFriend = function(profil) {
        $state.go('app.profil', { profil: profil.id });
    };

    vm.confirmFriend = function(friend) {
        Users.addFriend(friend.id, user.uid);
        Users.confirmFriend(user.uid, friend.id);
    };
});
