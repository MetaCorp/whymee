'use strict';
angular.module('main')
    .factory('Chats', function($q, Ref, $firebaseObject, $firebaseArray, FbUtil) {

    var chatsRef = Ref.child('chats');

    var getChat = function(chatId) {
        return $firebaseObject(chatsRef.child(chatId));
    };

    var getInfos = function(chatId) {
        return $firebaseObject(chatsRef.child(chatId + '/infos'));
    };

    var getMessages = function(chatId) {
        return $firebaseArray(chatsRef.child(chatId + '/messages'));
    };

    var sendMessage = function(chatId, message) {// TO DO : remove server call (prev message in fct)

        var messages = getMessages(chatId);

        messages.$loaded(function() {
            if (messages !== null && messages.length > 0 && 
                messages[messages.length - 1].owner === message.owner) {
                var prevMessage = $firebaseObject(Ref.child('chats/' + chatId + '/messages/' + messages[messages.length - 1].$id));

                prevMessage.$loaded(function() {
                    prevMessage.text = prevMessage.text + '\n' + message.text;
                    prevMessage.date = Date.now();
                    prevMessage.$save(); 
                });
            }
            else
                FbUtil.addOrSet(chatsRef.child(chatId + '/messages'), message);
        });


        var infos = getInfos(chatId);

        infos.$loaded(function() {
            infos.last = message;
            infos.$save();
        });
    };

    var addChat = function(chat) {
        var def = $q.defer();

        FbUtil.addOrSetObject(Ref.child('chats'), chat).then(function(ref) {
            def.resolve(ref);

            for(var i = 0; i < chat.users.length; i++)
                FbUtil.addOrSet(Ref.child('users/' + chat.users[i] + '/chats'), ref.key());
        });

        return def.promise;
    };

    var createChatWithTitle = function(user, title) {
        var def = $q.defer();

        var chats = $firebaseArray(chatsRef);

        chats.$loaded(function() {
            chats.$add({
                users: [user]
            }).then(function(ref) {
                var chatId = ref.key();
                def.resolve(chatId);

                FbUtil.addOrSet(Ref.child('users/' + user + '/chats'), {
                    id: chatId,
                    title: title
                });
            });
        });

        return def.promise;
    };

    var createChat = function(users) {
        var def = $q.defer();

        var chats = $firebaseArray(chatsRef);

        chats.$loaded(function() {
            chats.$add({
                users: users
            }).then(function(ref) {
                var chatId = ref.key();
                def.resolve(chatId);

                FbUtil.addOrSet(Ref.child('users/' + users[0] + '/chats'), {
                    id: chatId,
                    user: users[1]
                });

                FbUtil.addOrSet(Ref.child('users/' + users[1] + '/chats'), {
                    id: chatId,
                    user: users[0]
                });
            });
        });

        return def.promise;
    };

    // FIXED?
    var getOrCreate = function(user1Id, user2Id) {
        console.log('getOrCreate');
        var def = $q.defer();

        var userChatsRef = Ref.child('users/' + user1Id + '/chats');
        var userChats = $firebaseArray(userChatsRef);

        userChats.$loaded(function() {
            console.log('userChats:', userChats);
            var dataExists = userChats.$value !== null;

            if (!dataExists)
                createChat([user1Id, user2Id]).then(function(chatId) {
                    def.resolve(chatId); 
                });
            else {
                var bool = false;
                for(var i = 0; i < userChats.length; i++) {
                    if (userChats[i].user === user2Id)
                    {
                        def.resolve(userChats[i].id);
                        bool = true;
                    }
                }
                if (!bool)
                    createChat([user1Id, user2Id]).then(function(chatId) {
                        def.resolve(chatId); 
                    });
            }
        });

        return def.promise;
    };


    var createWithTitle = function(userId, wish) {
        var def = $q.defer();

        var userChatsRef = Ref.child('users/' + userId + '/chats');
        var userChats = $firebaseArray(userChatsRef);

        userChats.$loaded(function() {
            var dataExists = userChats.$value !== null;

            if (!dataExists) {
                createChatWithTitle(userId, wish.title).then(function(chatId) {
                    userChatsRef.$set({
                        title: wish.title,
                        wish: wish.$id,
                        id: chatId
                    });
                    def.resolve(chatId);
                });
            }
            else {
                createChatWithTitle(userId, wish.title).then(function(chatId) {
                    console.log('wish:', wish);
                    userChats.$add({
                        title: wish.title,
                        id: chatId
                    });
                    def.resolve(chatId);
                });
            }
        });

        return def.promise;
    };


    var getUsers = function(chatId) {
        return FbUtil.getItemsInfosFromIds(chatsRef.child(chatId + '/users'), Ref.child('users/'));
    };

    return {
        get: getChat,
        add: addChat,
        send: sendMessage,
        getOrCreate: getOrCreate,
        createWithTitle: createWithTitle,
        getMessages: getMessages,
        getUsers: getUsers,
        getInfos: getInfos
    };
});