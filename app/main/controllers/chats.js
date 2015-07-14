'use strict';
angular.module('main')
    .controller('ChatsCtrl', function($ionicPopup, $state, user, Users, Chats) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.chatsId = Users.getChatsIds(user.uid);
    vm.chats = [];
    
    var confirmPopup = null;

    vm.confirmDelete = function(chat) {
        confirmPopup = $ionicPopup.confirm({
            title: chat.title,
            template: 'Voulez vous archiver le chat?',
            cancelText: 'Annuler',
            okText: 'Archiver'
        });
        
        confirmPopup.then(function(res) {
            if (res)
                vm.deleteChat(chat.id);
        });
    };

    Users.getChats(user.uid).then(function(chats) {
        vm.chats = chats;
    });

    vm.selectChat = function(chat) {
        console.log('chat:', chat);
        $state.go('app.chat', { chat: chat.id });
    };

    vm.getUser = function(userId) {
        return Users.getInfos(userId);   
    };

    vm.deleteChat = function(chatId) {
        Users.deleteChat(user.uid, chatId);
    };

    vm.chatsId.$watch(function(event) {
        switch(event.event) {
            case 'child_added':
                console.log('event(add):', event);
                Users.getIdFromChat(user.uid, event.key).$loaded(function(data) {
                    console.log('child added:', data);
                    if (data.$value !== null) {
                        Chats.getInfos(data.$value).$loaded(function(data) {
                            vm.chats.push(data); 
                        });
                    }
                });
                break;
            case 'child_removed':
                console.log('event:(remove)', event);
                Users.getIdFromChat(user.uid, event.key).$loaded(function(data) {
                    var index = vm.chats.indexOf(data);
                    vm.chats.splice(index, 1);
                });
                break;
        }
    });
});