'use strict';
angular.module('main')
    .controller('AroundCtrl', function($state, user, Users, Wishes, uiGmapGoogleMapApi, geolocation, Geocode, Device) {

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

    vm.markers = [];

    vm.markerClicked = false;
    
    vm.currentDate = new Date();

    var wishStateDico = {};

    vm.subscribeWish = function(wish, event) {
        event.stopPropagation();
        event.preventDefault();

        wishStateDico[wish.id] = 'loading';
        Wishes.addPending(wish.id, user.uid).then(function() {
            wishStateDico[wish.id] = 'pending';
        });

        Users.sendNotif(wish.owner, { 
            title: vm.user.username + ' veut aussi ' + wish.title + '.',
            user: user.uid,
            type: 'wish',
            id: wish.id,
            new: true
        });

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

    vm.selectWish = function(wish) {
        $state.go('app.wish', { id: wish.id});
    };

    vm.getWishState = function(wishId) {
        if (wishStateDico[wishId] === undefined)
            Users.getWishState(user.uid, wishId).then(function(data) {
                wishStateDico[wishId] = data;
            });

        return wishStateDico[wishId];
    };

    var markerClick = function(data) {
        console.log('markerClick:', data);
        var wishClicked = $.grep(vm.wishes, function(wish){ return wish.id === data.key; })[0];
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
    
    vm.checkDate = function(date) {
        return date > vm.currentDate;
    };

    vm.mapClick = function(event) {
        if (vm.markerClicked) {
            console.log('markerClicked');
            console.log('event:', event);
            // Todo arrow popup
            // var x = event.x || event.pageX;
            var y = event.y || event.pageY;

            var top = y - 180;

            if (top > 0)
                vm.overlayY = {
                    'top': (y - 180) + 'px'
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
                                disableDefaultUI: false   
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
                        }
                    }); 
                });
            }).
            error(function(data) {
                console.log('Geocode error data:', data);
            });
        });
    });
});
