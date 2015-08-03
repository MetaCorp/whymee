'use strict';
angular.module('main')
    .controller('WishCtrl', function($state, $stateParams, $ionicHistory, $ionicPopup, user, Users, Wishes, Chats, uiGmapGoogleMapApi, Device) {

    var vm = this;

    vm.tabState = 'contributors';

    vm.user = Users.getInfos(user.uid);
    vm.pendings = [];
    vm.pendingsId = Wishes.getPendings($stateParams.id);
    vm.contributorsId = Wishes.getContributors($stateParams.id);
    vm.contributors = [];

    Wishes.getPendingsInfos($stateParams.id).then(function(data) {
        vm.pendings = data;
    });

    Wishes.getContributorsInfos($stateParams.id).then(function(data) {
        vm.contributorsInfos = data;
        console.log('data:', data);
    });

    vm.wish = Wishes.getInfos($stateParams.id);

    vm.wish.$loaded(function() {
        vm.messages = Chats.getMessages(vm.wish.chat);
    });

    vm.isPending = null;
    vm.isContributor = null;
    vm.isOwner = null;

    vm.screenWidth = Device.getWidth();
    vm.screenHeight = Device.getHeight();

    vm.selectedProfiles = [];
    vm.profilesArray = [];

    vm.owner = null;

    vm.state = Wishes.getState($stateParams.id);

    var confirmPopup = null;

    vm.selectProfil = function(profil) {
        console.log('select profil', profil.id);
        if (vm.selectedProfiles[profil.id]) {
            vm.selectedProfiles[profil.id] = false;
            vm.profilesArray.splice(vm.profilesArray.indexOf(profil), 1);
        }
        else {
            vm.selectedProfiles[profil.id] = true;
            vm.profilesArray.push(profil);   
        }
    };

    vm.getSelectedProfiles = function(userId) {
        return vm.selectedProfiles[userId];  
    };

    vm.contributorsId.$watch(function(event) {
        switch(event.event) {
            case 'child_added':
                Wishes.getIdFromContributors($stateParams.id, event.key).$loaded(function(data) {
                    console.log('child added:', data);
                    if (data.$value !== null) {
                        Users.getInfos(data.$value).$loaded(function(data) {
                            vm.contributors.push(data); 
                        });
                    }
                });
                break;
            case 'child_removed':
                console.log('child_removed pendings:', event);
                break;
        }
    });

    vm.pendingsId.$watch(function(event) {
        switch(event.event) {
            case 'child_added':
                Wishes.getIdFromPendings($stateParams.id, event.key).$loaded(function(data) {
                    console.log('child added:', data);
                    if (data.$value !== null) {
                        Users.getInfos(data.$value).$loaded(function(data) {
                            vm.pendings.push(data); 
                        });
                    }
                });
                break;
            case 'child_removed':
                console.log('child_removed pendings:', event);
                break;
        }
    });

    vm.getUser = function(userId) {
        return Users.getInfos(userId);
    };

    var usersArray = [];

    vm.sendMessage = function(text) {
        var message = {
            text: text,
            owner: user.uid,
            date: Date.now()
        };

        Chats.send(vm.wish.chat, message);

        for (var i = 0; i < usersArray.length; i++) {
            if (usersArray[i].id !== user.uid) {
                Users.sendNotif(usersArray[i].id, { // add chat title
                    title: 'Nouveau Message de ' + vm.user.username + ' sur .',
                    user: user.uid,
                    type: 'chat',
                    id: vm.wish.chat,
                    new: true
                });
            }
        }
        vm.messageTxt = '';
    };

    vm.user.$loaded(function() {
        vm.wish.$loaded(function() {
            Chats.getUsers(vm.wish.chat).then(function(data) {
                usersArray = data;
                var i;
                for(i = 0; i < data.length; i++) {
                    vm.users[data[i].id] = data[i];
                }
                console.log('vm.users:', vm.users);
            });

            if (vm.wish.owner === user.uid) {
                vm.state = 'owner';
                Wishes.setState($stateParams.id, 'owner');
            }
            else
                Users.getWishState(user.uid, $stateParams.id).then(function(data) {
                    vm.state = data;
                    Wishes.setState($stateParams.id, data);
                });

            uiGmapGoogleMapApi.then(function () {
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
                        icon: 'main/assets/images/picto-geolocalisation-autres.png'
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
        Wishes.setState($stateParams.id, 'pending');
    };

    vm.unPendingWish = function() {
        vm.state = 'loading';
        Wishes.setState($stateParams.id, 'loading');
        Wishes.removePending($stateParams.id, user.uid).then(function() {
            vm.state = 'none';
            Wishes.setState($stateParams.id, 'none');
        });
    };

    vm.unSubscribeWish = function() {
        confirmPopup = $ionicPopup.confirm({
            title: vm.wish.title,
            template: 'Êtes vous sûr de vouloir quitter cette envie?',
            cancelText: 'Annuler',
            okText: 'Quitter'
        });

        confirmPopup.then(function(res) {
            if (res) {
                Wishes.removeContributor($stateParams.id, user.uid);
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.around');
            }
        });
    };

    vm.goProfil = function(profilId) {
        if (vm.state === 'none' || vm.state === 'pending') return;

        $state.go('app.profil', { id: profilId });   
    };

    vm.chat = function() {
        $state.go('app.chat', { chat: vm.wish.chat });
    };

    vm.acceptPending = function(user) {
        Wishes.addContributor(vm.wish, user.id);
        Wishes.removePending($stateParams.id, user.id);
        vm.pendings.splice(vm.pendings.indexOf(user), 1);
    };

    vm.acceptPendings = function() {
        console.log('vm.profilesArray:', vm.profilesArray);
        for(var i = 0; i < vm.profilesArray.length; i++) {
            var user = vm.profilesArray[i];
            console.log('user accepted:', user.id);
            Wishes.addContributor(vm.wish, user.id);
            Wishes.removePending($stateParams.id, user.id);
            vm.pendings.splice(vm.pendings.indexOf(user), 1);
        }
        vm.profilesArray = [];
        vm.selectedProfiles = [];
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
