(function () {
    'use strict';
    angular.module('firebase.auth', ['firebase', 'firebase.ref'])

        .factory('Auth', function ($firebaseAuth, Ref) {
        var auth = $firebaseAuth(Ref);
        var lastOnlineRef = null;
        var connectedRef = null;

        auth.saveDisconnect = function () {
            if (lastOnlineRef && connectedRef) {
                lastOnlineRef.set(Firebase.ServerValue.TIMESTAMP);
                connectedRef.set(false);

                lastOnlineRef = null;
                connectedRef = null;
            }
            auth.$unauth();
        };

        auth.$onAuth(function (authData) {
            if (authData) {
                lastOnlineRef = Ref.child('users/' + authData.uid + '/infos/lastOnline');
                connectedRef = Ref.child('users/' + authData.uid + '/infos/connected');

                lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

                connectedRef.onDisconnect().set(false);
                connectedRef.set(true);
            }
        });

        return auth;
    });
})();
