'use strict';
angular.module('main')// TODO watch pendingsId, friendsId
    .controller('FriendsCtrl', function($state, user, Users) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);

    vm.friends = [];
    vm.friendsId = Users.getFriendsId(user.uid);
    vm.pendingFriends = [];
    vm.pendingsId = Users.getPendingFriendsId(user.uid);

    vm.pendingsId.$watch(function(event) {
        switch(event.event) {
            case 'child_added':
                Users.getIdFromPendingFriends(user.uid, event.key).$loaded(function(data) {
                    console.log('child added:', data);
                    if (data.$value !== null) {
                        Users.getInfos(data.$value).$loaded(function(data) {
                            vm.pendingFriends.push(data); 
                        });
                    }
                });
                break;
            case 'child_removed':
                console.log('child_removed pendings:', event);
                break;
        }
    });

    vm.friendsId.$watch(function(event) {
        switch(event.event) {
            case 'child_added':
                Users.getIdFromFriends(user.uid, event.key).$loaded(function(data) {
                    console.log('child added:', data);
                    if (data.$value !== null) {
                        Users.getInfos(data.$value).$loaded(function(data) {
                            vm.friends.push(data); 
                        });
                    }
                });
                break;
            case 'child_removed':
                console.log('event:', event);
                /*Users.getIdFromWishes(user.uid, event.key).$loaded(function(data) {
                        var index = vm.wishes.indexOf(data);
                        console.log('splice:', data);
                        //vm.wishes.splice(index, 1);
                    });*/
                break;
        }
    });

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
        vm.pendingFriends.splice(vm.pendingFriends.indexOf(friend), 1);
    };

    // TODO display pending friends
});
