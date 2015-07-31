'use strict';
angular.module('main')
    .factory('Wishes', function($q, Ref, $firebaseArray, $firebaseObject, Geocode, FbUtil) {

    var wishDico = {};
    var stateDico = {};

    var wishes = $firebaseArray(Ref.child('wishes'));

    var getWish = function(wishId) {
        return $firebaseObject(Ref.child('wishes/' + wishId));  
    };

    var getInfos = function(wishId) {
        if (wishDico[wishId] === undefined)
            wishDico[wishId] = $firebaseObject(Ref.child('wishes/' + wishId + '/infos'));

        return wishDico[wishId];
    };

    var getRange = function(location) {
        return FbUtil.getItemsInfosFromIds(Ref.child('wishes-loc/' + location.country + '/' + location.region), Ref.child('wishes'));
    };

    var addWish = function(wish) {
        var def = $q.defer();

        FbUtil.addOrSetObject(Ref.child('wishes'), wish).then(function(ref) {
            def.resolve(ref);

            FbUtil.addOrSet(Ref.child('wishes-loc/' + wish.location.country + '/' + 
                                      wish.location.region), ref.key());
        });

        return def.promise;
    };

    var addPending = function(wishId, userId) { // TODO notif
        //        Materialize.toast('Votre demande à bien été prise en compte.', 4000);
        return FbUtil.addOrSet(Ref.child('wishes/' + wishId + '/pendings'), userId);
    };

    var removePending = function(wishId, userId) {
        return FbUtil.removeIdFromArray(Ref.child('wishes/' + wishId + '/pendings'), userId);
    };

    var getPendings = function(wishId) {
        return $firebaseArray(Ref.child('wishes/' + wishId + '/pendings'));
    };

    var getContributors = function(wishId) {
        return $firebaseArray(Ref.child('wishes/' + wishId + '/contributors'));
    };

    var getContributorsInfos = function(wishId) {
        console.log('getContrib infos');
        return FbUtil.getItemsInfosFromIds(Ref.child('wishes/' + wishId + '/contributors'), Ref.child('users'));
    };

    var addContributor = function(wish, userId) {
        FbUtil.addOrSet(Ref.child('wishes/' + wish.id + '/contributors'), userId);

        FbUtil.addOrSet(Ref.child('chats/' + wish.chat + '/infos/users'), userId);
        FbUtil.addOrSet(Ref.child('users/' + userId + '/historic'), wish.id);
        FbUtil.addOrSet(Ref.child('users/' + userId + '/chats'), wish.chat);

        var infos = getInfos(wish.id);

        infos.$loaded(function() {
            infos.contributors = infos.contributors + 1;
            infos.$save();
        });
    };

    var getPendingsInfos = function(wishId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('wishes/' + wishId + '/pendings'), Ref.child('users'));
    };

    var getFromLocation = function(location) {
        return $firebaseArray(Ref.child('wishes-loc/' + location.country + '/' + location.region));   
    };

    var getIdFromLoc = function(location, id) {
        return $firebaseObject(Ref.child('wishes-loc/' + location.country + '/' + location.region + '/' + id));
    };

    var removeContributor = function(wish, id) {
        FbUtil.removeIdFromArray(Ref.child('wishes/' + wish.id + '/contributors'), id);
        // TODO update nb contrib
        var infos = getInfos(wish.id);

        infos.$loaded(function() {
            infos.contributors = infos.contributors - 1;
            infos.$save();
        });
    };
    
    var getState = function(wishId) {
        return stateDico[wishId];
    };
    
    var setState = function(wishId, state) {
        stateDico[wishId] = state;
    };

    return {
        all: wishes,
        getRange: getRange,
        add: addWish,
        get: getWish,
        getInfos: getInfos,
        addPending: addPending,
        getPendings: getPendings,
        getContributors: getContributors,
        addContributor: addContributor,
        removePending: removePending,
        getPendingsInfos: getPendingsInfos,
        getFromLocation: getFromLocation,
        getIdFromLoc: getIdFromLoc,
        getContributorsInfos: getContributorsInfos,
        removeContributor: removeContributor,
        getState: getState,
        setState: setState
    };
});