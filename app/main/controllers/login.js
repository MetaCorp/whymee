'use strict';
angular.module('main')
    .controller('LoginCtrl', function($state, $q, $ionicHistory, Auth, Ref, $timeout, User, Users) {

    var vm = this;

    vm.passwordLogin = function() {
        Auth.$authWithPassword({email: vm.email, password: vm.pass}, {rememberMe: true}).then(
            redirect, showError
        );
    };

    vm.facebookLogin = function() {
        Auth.$authWithOAuthPopup('facebook').then(checkFb).catch(showError);
    };

    vm.createAccount = function() {
        function createProfile(user) {
            var ref = Ref.child('users/' + user.uid);
            var def = $q.defer();

            var newUser = {
                infos: {
                    id: user.uid,
                    email: vm.email,
                    username: firstPartOfEmail(vm.email),
                    first_name: '',
                    last_name: '',
                    rate: 0,
                    nb_rate: 0,
                    date_birth: '',
                    age: 0,
                    address: '',
                    country: '',
                    city: '',
                    avatar: '',
                    range: 5,
                    location: {
                        lat: '',
                        long: '',
                        address: '',
                        country: '',
                        region: ''
                    },
                    sex: 'male'
                },
                friends: [],
                historic: [],
                pendings: [],
                chats: []
            };

            ref.set(newUser, function(err) {
                $timeout(function() {
                    if( err ) {
                        def.reject(err);
                    }
                    else {
                        def.resolve(ref);
                    }
                });
            });
            return def.promise;
        }

        if( !vm.pass ) {
            showError('Please enter a password');
        }
        else if( vm.pass !== vm.confirm ) {
            showError('Passwords do not match');
        }
        else {
            Auth.$createUser({email: vm.email, password: vm.pass})
                .then(function () {
                // authenticate so we have permission to write to Firebase
                return Auth.$authWithPassword({email: vm.email, password: vm.pass}, {rememberMe: true});
            })
                .then(createProfile)
                .then(redirectNewUser, showError);
        }


    };

    function checkFb(authData) {
        console.log('authData:', authData);
        Users.exists().then(function(exist) {
            console.log('exist:', exist);
            if (!exist)
                Users.addFbUser(authData);

            redirect(authData);
        });

    }

    function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
    }

    function redirect(authData) {
        console.log('Logged in as:', authData.uid);
        User.set(authData.uid);
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.around');
    }

    function redirectNewUser(authData) {
        console.log('Logged in as:', authData.uid);
        User.set(authData.uid);
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.around');// TODO Intro
    }

    function showError(err) {
        console.log(err);// TODO Toast err
        Materialize.toast(err, 4000);
    }

});
