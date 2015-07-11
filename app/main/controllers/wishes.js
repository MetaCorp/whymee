'use strict';
angular.module('main')
    .controller('WishesCtrl', function($state, user, User, Users, Wishes) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);

    vm.wishIds = Users.getWishIds(user.uid);
    vm.wishes = [];

    vm.historicIds = Users.getHistoricIds(user.uid);
    vm.historic = [];

    var contribDico = {};

    Users.getWishes(user.uid).then(function(data) {
        vm.wishes = data;
        console.log('wishes:', data);

        function ret(data) {
            console.log('data:', data);
            contribDico[vm.wishes[i].id] = data;            
        }

        for(var i = 0; i < vm.wishes.length; i++) {
            console.log('vm.wishes[i].id:', vm.wishes[i].id);
            Wishes.getContributorsInfos(vm.wishes[i].id).then(ret);
        }

        vm.wishIds.$watch(function(event) {
            switch(event.event) {
                case 'child_added':
                    Users.getIdFromWishes(user.uid, event.key).$loaded(function(data) {
                        console.log('child added:', data);
                        if (data.$value !== null) {
                            Wishes.getInfos(data.$value).$loaded(function(data) {
                                vm.wishes.push(data); 
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
    });

    Users.getHistoric(user.uid).then(function(data) {
        vm.historic = data;
        console.log('historic:', data);

        function ret(data) {
            console.log('data:', data);
            contribDico[vm.historic[i].id] = data;            
        }


        for(var i = 0; i < vm.historic.length; i++) {
            Wishes.getContributorsInfos(vm.historic[i].id).then(ret);
        }

        vm.historicIds.$watch(function(event) {
            switch(event.event) {
                case 'child_added':
                    Users.getIdFromHistoric(user.uid, event.key).$loaded(function(data) {
                        console.log('child added:', data);
                        if (data.$value !== null) {
                            Wishes.getInfos(data.$value).$loaded(function(data) {
                                vm.historic.push(data); 
                            });
                        }
                    });
                    break;
                case 'child_removed':
                    console.log('event:', event);
                    /*
                    Users.getIdFromHistoric(user.uid, event.key).$loaded(function(data) {
                        var index = vm.historic.indexOf(data);
                        console.log('splice:', data);
                        //vm.historic.splice(index, 1);
                    });*/
                    break;
            }
        });
    });

    vm.user.$loaded(function() {
        console.log('vm.user:', vm.user);
    });

    vm.selectWish = function(wish) {
        console.log('wish:', wish);
        $state.go('app.wish', { id: wish.id });
    };

    vm.getUser = function(userId) {
        return Users.getInfos(userId);   
    };

    vm.deleteWishFromHistoric = function(wish) {
        vm.historic.splice(vm.historic.indexOf(wish), 1);
        Users.deleteWishFromHistoric(user.uid, wish.id);
    };

    vm.cancelWish = function(wish) {
        vm.wishes.splice(vm.wishes.indexOf(wish), 1);
        Users.cancelWish(user.uid, wish);
    };

    vm.getContributors = function(wishId) {
        return contribDico[wishId];  
    };

    vm.goProfil = function(userId, event) {

        $state.go('app.profil', { id: userId });
        event.stopPropagation();
        event.preventDefault();
    };

});
