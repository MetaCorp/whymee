'use strict';
angular.module('main')
    .factory('User', function($q, Auth) {

    var user = null;

    var setUser = function(uid) {
        console.log('setUser:', uid);
        user = uid;
    };

    var isAuthentificated = function() {
        return user !== null;   
    };

    var getUser = function() {
        var dfd = $q.defer();

        setTimeout(function() {
            dfd.resolve(Auth.$requireAuth());
        }, 2000);

        return dfd.promise;
    };
    
    

    return {
        set: setUser,
        get: getUser,
        isAuthentificated: isAuthentificated
    };
});