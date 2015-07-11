'use strict';
angular.module('main')
    .controller('NewWishCtrl', function($state, $ionicHistory, user, Users, Wishes, Geocode, Chats, geolocation, uiGmapGoogleMapApi) {

    var vm = this;
    //    $('#age-minmax').ionRangeSlider({
    //        type: 'double',
    //        min: 1000,
    //        max: 5000,
    //        from: 2000,
    //        to: 4000,
    //        step: 100,
    //        onStart: function (data) {
    //            console.log(data);
    //        },
    //        onChange: function (data) {
    //            console.log(data);
    //        },
    //        onFinish: function (data) {
    //            console.log(data);
    //        },
    //        onUpdate: function (data) {
    //            console.log(data);
    //        }
    //    });

    vm.user = Users.getInfos(user.uid);

    console.log('Date.today():', Date.parse('today'));

    vm.duration = 60;
    vm.startIn = 0;

    vm.mapOpen = false;

    vm.wishDate = new Date();

    vm.wish = {
        title: '',
        sex: 'both',
        age_min: 0,
        age_max: 99,
        date_start: new Date(),
        date_end: new Date(new Date().getTime() + (5 * 60000)).getTime(),
        date_post: null,
        location: {
            lat: 48.88800,
            long: 2.34151,
            address: null,
            country: null,
            region: null
        },
        owner: user.uid,
        contributors_max: 5,
        chat: null,
        id: null,
        contributors: 1,
        nb_wish: 0,
        score: 0// TODO update nb_wish and score in service
    };

    vm.male = true;
    vm.female = true;

    vm.user.$loaded(function() {
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
    });

    vm.sexChanged = function() {
        if (vm.male && vm.female)
            vm.wish.sex = 'both';
        else if (vm.male)
            vm.wish.sex = 'male';
        else if (vm.female)
            vm.wish.sex = 'female';
        else
            vm.wish.sex = 'none';
        console.log('vm.wish.sex:', vm.wish.sex);
    };

    var toWish = function(wishId) {
        vm.wish = {
            title: '',
            sex: 'both',
            age_min: 0,
            age_max: 99,
            date_start: new Date(),
            date_end: new Date(new Date().getTime() + (5 * 60000)).getTime(),
            date_post: null,
            location: {
                lat: 48.88800,
                long: 2.34151,
                address: null,
                country: null,
                region: null
            },
            owner: user.uid,
            contributors_max: 5,
            chat: null,
            id: null,
            contributors: 1,
            nb_wish: 0,
            score: 0
        };

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.wish', { id: wishId });
    };

    vm.postWish = function() {
        vm.wish.date_post = Date.now();

        vm.wish.date_start = vm.wishDate.getTime();//new Date(new Date().getTime() + (vm.startIn * 60000)).getTime();
        vm.wish.date_end = new Date(new Date().getTime() + ((vm.startIn + vm.duration) * 60000)).getTime();

        geolocation.getLocation().then(function(data) {
            vm.wish.location.lat = data.coords.latitude; 
            vm.wish.location.long = data.coords.longitude;
            Geocode.get(vm.wish.location).
            success(function(data) {
                console.log('Geocode data:', data);
                vm.wish.location.address = data.results[0].formatted_address;
                vm.wish.location.country = Geocode.parse(data.results[0], 'country');
                vm.wish.location.region = Geocode.parse(data.results[0], 'administrative_area_level_1');

                console.log('Wish data:', vm.wish);

                Chats.add({
                    users: [user.uid],
                    title: vm.wish.title
                }).then(function(ref) {
                    vm.wish.chat = ref.key();
                    Wishes.add(vm.wish).then(function(ref) {
                        Users.addWish(user.uid, ref.key()).then(function() {
                            toWish(ref.key());
                        });
                    });
                });
            }).
            error(function(data) {
                console.log('Geocode error data:', data);
            }); 
        });
    };

});
