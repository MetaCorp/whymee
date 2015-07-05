'use strict';
angular.module('main')
    .controller('WishCtrl', function($state, $stateParams, user, Users, Wishes, uiGmapGoogleMapApi, Device) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.pendings = Wishes.getPendings($stateParams.id);
    vm.contributors = Wishes.getContributors($stateParams.id);

    vm.wish = Wishes.getInfos($stateParams.id);

    vm.isPending = null;
    vm.isContributor = null;
    vm.isOwner = null;

    vm.screenWidth = Device.getWidth();
    vm.screenHeight = Device.getHeight();

    vm.owner = null;

    vm.state = 'none';

    vm.user.$loaded(function() {
        vm.wish.$loaded(function() {
            if (vm.wish.owner === user.uid)
                vm.state = 'owner';
            else
                Users.getWishState(user.uid, $stateParams.id).then(function(data) {
                    vm.state = data;
                });

            uiGmapGoogleMapApi.then(function() {
                vm.map = { 
                    center: { 
                        latitude: vm.wish.location.lat,
                        longitude: vm.wish.location.long 
                    }, 
                    zoom: 16,
                    bounds: {},
                    options: {
                        disableDefaultUI: true   
                    }
                };

                vm.marker =
                    {
                    coords: {
                        latitude: vm.wish.location.lat,
                        longitude: vm.wish.location.long
                    },
                    id: 0,
                    options: {
                        icon: 'main/assets/images/picto-geolocalisation-autres-copie-2.png'
                    }
                };

            });

            vm.isOwner = vm.wish.owner === user.uid;
            vm.owner = Users.getInfos(vm.wish.owner);

            if (contains(vm.pendings, user.uid))
                vm.isPending = true;

            if (contains(vm.contributors, user.uid))
                vm.isContributor = true;
        });
    });

    Wishes.getPendingsInfos($stateParams.id).then(function(data) {
        vm.pendingsInfos = data;
    });

    vm.subscribeWish = function() {
        Users.subscribeWish(vm.user.id, $stateParams.id);
        Wishes.addPending($stateParams.id, vm.user.id);
        Users.sendNotif(vm.wish.owner, { 
            title: vm.user.username + ' veut aussi ' + vm.wish.title + '.',
            user: user.uid,
            type: 'wish',
            id: $stateParams.id,
            new: true
        });
        vm.state = 'pending';
    };

    vm.unPendingWish = function() {
        vm.state = 'loading';
        Wishes.removePending($stateParams.id, user.uid).then(function() {
            vm.state = 'none';
        });
    };

    vm.showProfil = function() {
        $state.go('app.profil', { profil: vm.wish.owner });   
    };

    vm.chat = function() {
        $state.go('app.chat', { chat: vm.wish.chat });
    };

    vm.acceptPending = function(user) {
        Wishes.addContributor(vm.wish, user.id);
        Wishes.removePending($stateParams.id, user.id);
        vm.pendingsInfos.splice(0, 0);// TO DO remove user infos for real time
    };

    var contains = function(array, id) {
        if (array === undefined) return false;

        var bool = false;
        for(var i = 0; i < array.length; i++) {
            if (array[i].$value === id)
                bool = true;
        }
        return bool;
    };
});
