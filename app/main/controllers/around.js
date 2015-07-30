'use strict';
angular.module('main')
    .controller('AroundCtrl', function($ionicPopup, $timeout, $state, user, Users, Wishes, uiGmapGoogleMapApi, geolocation, Geocode, Device) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.wishes = [];

    vm.wishIds = [];

    vm.selectedWish = null;

    vm.screenWidth = Device.getWidth();
    vm.screenHeight = Device.getHeight();

    vm.overlayY = {
        'top': '500px'
    };
    vm.overlayY = {
        'left': '200px'
    };

    vm.mapCtrl = null;

    vm.markers = [];

    vm.markerClicked = false;

    vm.currentDate = new Date();

    vm.mapLoaded = false;

    var wishStateDico = {};

    var confirmPopup = null;

    vm.preventProp = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };

    vm.confirmDelete = function(wish, event) {
        event.stopPropagation();
        event.preventDefault();
        confirmPopup = $ionicPopup.confirm({
            title: wish.title,
            template: 'Êtes vous sûr de vouloir quitter cette envie?',
            cancelText: 'Annuler',
            okText: 'Quitter'
        });

        confirmPopup.then(function(res) {
            if (res) // TODO ; remove contributor
                vm.unPendingWish(wish);
        });
    };

    vm.subscribeWish = function(wish, event) {
        event.stopPropagation();
        event.preventDefault();

        wishStateDico[wish.id] = 'loading';
        Wishes.addPending(wish.id, user.uid).then(function() {
            wishStateDico[wish.id] = 'pending';
            Materialize.toast('Votre demande à bien été prise en compte.', 4000);
        });

        Users.sendNotif(wish.owner, { 
            title: vm.user.username + ' veut aussi ' + wish.title + '.',
            user: user.uid,
            type: 'wish',
            id: wish.id,
            new: true
        });

    };

    vm.centerMap = function() {
        vm.map.center = {
            latitude: vm.user.location.lat,
            longitude: vm.user.location.long
        };
        vm.selectedWish = null;

        vm.map.zoom = 16;
    };

    vm.unPendingWish = function(wish, event) {
        event.stopPropagation();
        event.preventDefault();

        wishStateDico[wish.id] = 'loading';
        Wishes.removePending(wish.id, user.uid).then(function() {
            wishStateDico[wish.id] = 'none';
        });
    };

    vm.getUser = function(userId) {
        return Users.getInfos(userId);   
    };

    vm.selectWish = function(wish) {// TODO splash screen for performance?
        $state.go('app.wish', { id: wish.id });
    };

    vm.getWishState = function(wish) {
        if (wish === undefined || wish === null) return 'none';

        if (wishStateDico[wish.id] === undefined) {

            if (wish.owner === user.uid)
                wishStateDico[wish.id] = 'owner';
            else
                Users.getWishState(user.uid, wish.id).then(function(data) {
                    wishStateDico[wish.id] = data;
                });
        }

        return wishStateDico[wish.id];
    };

    var markerClick = function(data) {
        var wishClicked = $.grep(vm.wishes, function(wish) { return wish.id === data.key; })[0];
        if (wishClicked === vm.selectedWish) return;

        vm.selectedWish = wishClicked;
        console.log('vm.selectedWish:', vm.selectedWish.title);
        vm.markerClicked = true;
    };

    vm.checkSex = function(sex) {
        if (sex === 'both')
            return true;
        else
            return vm.user.sex === sex;
    };

    vm.checkDate = function(wish) {
        //        console.log('\nwish.title:', wish.title);
        //        console.log('vm.currentDate:', vm.currentDate);
        //        console.log('date:', new Date(wish.date_start));
        return new Date(wish.date_start) < vm.currentDate;
    };

    vm.mapClick = function(event) {
        if (vm.markerClicked) {
            console.log('markerClicked');
            console.log('event:', event);
            // Todo arrow popup
            var y = event.y || event.pageY;
            var x = event.x || event.pageX;

            vm.overlayX = {
                'left': (x - 31) + 'px'
            };

            var top = y - 180;

            if (top > 0)
                vm.overlayY = {
                    'top': (y - 200) + 'px'
                };
            else
                vm.overlayY = {
                    'top': y + 'px'
                };

            console.log('vm.overlayY:', vm.overlayY);

            vm.markerClicked = false;
        }
        else
            vm.selectedWish = null;
    };


    vm.user.$loaded(function() {
        // get coords
        geolocation.getLocation().then(function(data) {
            vm.user.location.lat = data.coords.latitude || 40; 
            vm.user.location.long = data.coords.longitude || 38;
            console.log('user location:', vm.user.location);

            //get location
            Geocode.get(vm.user.location).
            success(function(data) {
                console.log('geocode data:', data);
                vm.user.location.address = data.results[0].formatted_address;
                vm.user.location.country = Geocode.parse(data.results[0], 'country');
                vm.user.location.region = Geocode.parse(data.results[0], 'administrative_area_level_1');

                vm.wishIds = Wishes.getFromLocation(vm.user.location);
                console.log('geocode location:', vm.user.location);

                // fetch wishes code dont go here if no wish in wish-loc
                Wishes.getRange(vm.user.location).then(function(data) {
                    console.log('data:', data);
                    vm.wishes = data;
                    console.log('vm.wishes:', vm.wishes);
                    console.log('vm.wishIds:', vm.wishIds);
                    vm.wishIds.$watch(function(event) {
                        console.log('event:', event);
                        switch(event.event) {
                            case 'child_added':
                                console.log('child added');
                                Wishes.getIdFromLoc(vm.user.location, event.key).$loaded(function(data) {
                                    var wish = Wishes.getInfos(data.$value);
                                    vm.wishes.push(wish);
                                    // ADD MARKER
                                    wish.$loaded(function() {
                                        console.log('add marker', wish);
                                        vm.markers.push({
                                            coords: {
                                                latitude: wish.location.lat,
                                                longitude: wish.location.long
                                            },
                                            id: wish.id,
                                            options: {
                                                labelContent: '',
                                                icon: 'main/assets/images/picto-geolocalisation-autres-copie-2.png'
                                            },
                                            events: {
                                                click: markerClick
                                            }
                                        });
                                    });
                                });
                                break;
                            case 'child_removed':
                                console.log('child removed');
                                break;
                        }
                    });

                    // init Google map
                    uiGmapGoogleMapApi.then(function() {
                        vm.map = { 
                            center: { 
                                latitude: vm.user.location.lat,
                                longitude: vm.user.location.long 
                            }, 
                            zoom: 16,
                            bounds: {},
                            options: {
                                disableDefaultUI: true
                            },
                            events: {
                                dragstart: function () {
                                    vm.selectedWish = null;
                                }   
                            }
                        };

                        vm.markers = [
                            {
                                coords: {
                                    latitude: vm.user.location.lat,
                                    longitude: vm.user.location.long
                                },
                                id: vm.markers.length,
                                options: {
                                    icon: 'main/assets/images/picto-geolocalisation-perso.png'
                                }
                            }
                        ];

                        for(var i = 0; i < vm.wishes.length; i++) {
                            if (vm.wishes[i].owner !== user.uid)
                                vm.markers.push({
                                    coords: {
                                        latitude: vm.wishes[i].location.lat,
                                        longitude: vm.wishes[i].location.long
                                    },
                                    id: vm.wishes[i].id,
                                    options: {
                                        labelContent: '',
                                        icon: 'main/assets/images/picto-geolocalisation-autres-copie-2.png'
                                    },
                                    events: {
                                        click: markerClick
                                    }
                                });
                            else
                                vm.markers.push({
                                    coords: {
                                        latitude: vm.wishes[i].location.lat,
                                        longitude: vm.wishes[i].location.long
                                    },
                                    id: vm.wishes[i].id,
                                    options: {
                                        labelContent: '',
                                        icon: 'main/assets/images/picto-geolocalisation-perso.png'
                                    },
                                    events: {
                                        click: markerClick
                                    }
                                });
                        }
                        $timeout(function() {
                            vm.mapLoaded = true;
                        }, 1000);
                    }); 
                });
            }).
            error(function(data) {
                console.log('Geocode error data:', data);
            });
        });
    });
});
