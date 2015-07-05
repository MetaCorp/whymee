'use strict';
angular.module('main')
    .controller('ChatsCtrl', function($state, user, Users) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.chats = [];
    
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

});