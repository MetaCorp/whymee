'use strict';
angular.module('main')
    .factory('Users', function($q, $timeout, Ref, $firebaseObject, $firebaseArray, FbUtil) {

    var userDico = {};

    var getUser = function(userId) {
        return $firebaseObject(Ref.child('users/' + userId));
    };

    var getUserInfos = function(userId) {
        if (userDico[userId] === undefined)
            userDico[userId] = $firebaseObject(Ref.child('users/' + userId + '/infos'));

        return userDico[userId];
    };

    var exists = function(userId) {
        var def = $q.defer();

        $firebaseObject(Ref.child('users/' + userId)).$loaded(function(data) {
            console.log('data:', data);
            def.resolve(data.$value !== null);
        });

        return def.promise;
    };

    var getFriends = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/friends'), Ref.child('users'));
    };

    var getWishes = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/wishes'), Ref.child('wishes'));
    };
    
    var getWishesJoin = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/wishesJoin'), Ref.child('wishes'));
    };

    var getHistoric = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/historic'), Ref.child('wishes'));
    };

    // TO FIX
    var getChats = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/chats'), Ref.child('chats'));
    };

    var getPendingFriends = function(userId) {
        return FbUtil.getItemsInfosFromIds(Ref.child('users/' + userId + '/pendingFriends'), Ref.child('users'));
    };

    var getPendings = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/pendings'));
    };

    var getNotifications = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/notifications'));
    };

    var subscribeWish = function(userId, wishId) {// deprecated TODO notif
        Materialize.toast('Votre demande a bien été prise en compte.', 4000);
        FbUtil.addOrSet(Ref.child('users/' + userId + '/pendings'), wishId);
    };

    var addPendingFriend = function(userId, friendId) {// TODO notif
        Materialize.toast('Votre demande a bien été envoyée.', 4000);
        FbUtil.addOrSet(Ref.child('users/' + userId + '/pendingFriends'), friendId);
    };

    var addFriend = function(userId, friendId) {
        FbUtil.addOrSet(Ref.child('users/' + userId + '/friends'), friendId);
    };

    var removePendingFriend = function(userId, friendId) {
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/pendingFriends'), friendId);
    };

    var confirmFriend = function(userId, friendId) {
        var friend = getUserInfos(friendId);
        Materialize.toast('Vous êtes maintenant ami(e)s avec ' + friend.first_name + '.', 4000);
        FbUtil.addOrSet(Ref.child('users/' + userId + '/friends'), friendId);

        removePendingFriend(userId, friendId);
    };
    
    var removeFriend = function(userId, friendId) {
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/friends'), friendId);
    };

    var addWish = function(userId, wish) {// TODO notif
        //        Materialize.toast('Votre nouvelle envie à été postée    .', 4000);
        return FbUtil.addOrSet(Ref.child('users/' + userId + '/wishes'), wish);
    };

    var sendNotif = function(userId, notif) {
        FbUtil.addOrSet(Ref.child('users/' + userId + '/notifications'), notif);
    };

    var endWish = function(userId, wish) {// TODO notif
        console.log('endWish:', wish);
        //        Materialize.toast('Votre envie "' + wish.title + '" se termine.', 4000);

        // to user.historic
        FbUtil.addOrSet(Ref.child('users/' + userId + '/historic'), wish.id);

        // remove from user.wishes
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/wishes'), wish.id);

        // delete from wishes/...
        FbUtil.removeIdFromArray(Ref.child('wishes-loc/' + wish.location.country + '/' + wish.location.region), wish.id);
    };

    var addFbUser = function(authData) {
        var def = $q.defer();
        var fbInfos = authData.facebook.cachedUserProfile;

        var ref = Ref.child('users/' + authData.uid);

        var newUser = {
            infos: {
                id: authData.uid,
                email: '',
                username: fbInfos.name,
                first_name: fbInfos.first_name,
                last_name: fbInfos.last_name,
                rate: 0,
                nb_rate: 0,
                date_birth: '',
                age: 0,
                address: '',
                country: '',
                city: '',
                avatar: fbInfos.picture.data.url,
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

        console.log('New fb user');
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
    };

    var getHistoricIds = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/historic'));
    };

    var getWishIds = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/wishes'));
    };

    var getIdFromHistoric = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/historic/' + id));   
    };

    var getIdFromWishes = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/wishes/' + id));   
    };

    var getNotif = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/notifications/' + id));   
    };

    var checkNotif = function(userId, notifId) {
        var notif = $firebaseObject(Ref.child('users/' + userId + '/notifications/' + notifId));

        notif.$loaded(function() {
            notif.new = false;
            notif.$save();
        });
    };

    var deleteWishFromHistoric = function(userId, wishId) {
        console.log('delete');
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/historic'), wishId);
    };

    var cancelWish = function(userId, wish) {
        console.log('cancel');
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/wishes'), wish.id);
        FbUtil.removeIdFromArray(Ref.child('wishes-loc/' + wish.location.country + '/' + wish.location.region), wish.id);
    };

    var getWishState = function(userId, wishId) {
        var def = $q.defer();

        FbUtil.arrayContainsId(Ref.child('wishes/' + wishId + '/contributors'), userId).then(function(bool) {
            if (bool)
                def.resolve('contributor');
            else
                FbUtil.arrayContainsId(Ref.child('wishes/' + wishId + '/pendings'), userId).then(function(bool) {
                    if (bool)
                        def.resolve('pending');
                    else
                        def.resolve('none');

                });
        });

        return def.promise;
    };

    var updateGeoloc = function(userId, location) {
        console.log('new location:', location);
        var user = getUserInfos(userId);

        user.$loaded(function() {
            user.location = location;
            user.$save();
        });
    };

    var deleteChat = function(userId, chatId) {
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/chats'), chatId);
    };

    var getChatsIds = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/chats'));
    };

    var getIdFromChat = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/chats/' + id));   
    };
    
    var removeWish = function(userId, wish) {
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/wishes'), wish.id);  
        FbUtil.removeIdFromArray(Ref.child('users/' + userId + '/chats'), wish.chat);  
    };
    
    var getFriendsId = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/friends'));  
    };
    
    var getPendingFriendsId = function(userId) {
        return $firebaseArray(Ref.child('users/' + userId + '/pendingFriends'));  
    };
    
    var getIdFromPendingFriends = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/pendingFriends/' + id));
    };
    
    var getIdFromFriends = function(userId, id) {
        return $firebaseObject(Ref.child('users/' + userId + '/friends/' + id));
    };

    return {
        get: getUser,
        getInfos: getUserInfos,
        subscribeWish: subscribeWish,
        addFriend: addFriend,
        getFriends: getFriends,
        getChats: getChats,
        getPendings: getPendings,
        getPendingFriends: getPendingFriends,
        addPendingFriend: addPendingFriend,
        confirmFriend: confirmFriend,
        getHistoric: getHistoric,
        getWishes: getWishes,
        getWishesJoin: getWishesJoin,
        addWish: addWish,
        getNotifications: getNotifications,
        sendNotif: sendNotif,
        endWish: endWish,
        exists: exists,
        addFbUser: addFbUser,
        getHistoricIds: getHistoricIds,
        getIdFromHistoric: getIdFromHistoric,
        getNotif: getNotif,
        checkNotif: checkNotif,
        getWishIds: getWishIds,
        deleteWishFromHistoric: deleteWishFromHistoric,
        cancelWish: cancelWish,
        getWishState: getWishState,
        updateGeoloc: updateGeoloc,
        deleteChat: deleteChat,
        getChatsIds: getChatsIds,
        getIdFromChat: getIdFromChat,
        getIdFromWishes: getIdFromWishes,
        removeWish: removeWish,
        removePendingFriend: removePendingFriend,
        removeFriend: removeFriend,
        getFriendsId: getFriendsId,
        getPendingFriendsId: getPendingFriendsId,
        getIdFromPendingFriends: getIdFromPendingFriends,
        getIdFromFriends: getIdFromFriends
    };
});