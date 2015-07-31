'use strict';
angular.module('main')// TODO watch pendingsId, friendsId
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
        $state.go('app.profil', { id: profil.id });
    };

    vm.confirmFriend = function(friend, event) {
        event.stopPropagation();
        event.preventDefault();
        Users.addFriend(friend.id, user.uid);
        Users.confirmFriend(user.uid, friend.id);
    };
    
    // TODO display pending friends
});
