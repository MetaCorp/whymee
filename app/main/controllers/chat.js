'use strict';
angular.module('main')
    .controller('ChatCtrl', function($state, $stateParams, user, Users, Chats, Device) {

    console.log('Chat controller instanciated!');

    var vm = this;

    vm.user = Users.getInfos(user.uid);
    vm.users = {};

    vm.messageTxt = '';

    var usersArray = [];
    Chats.getUsers($stateParams.chat).then(function(data) {
        usersArray = data;
        console.log('data:', data);
        var i;
        for(i = 0; i < data.length; i++) {
            console.log('i:', data[i]);
            vm.users[data[i].id] = data[i];
        }
        console.log('vm.users:', vm.users);
    });
    vm.messages = Chats.getMessages($stateParams.chat);

    vm.screenHeight = Device.getHeight();

    vm.profil = function() {
        //        $state.go('app.profil', { profil: $stateParams.chat });  
    };

    vm.sendMessage = function(text) {
        var message = {
            text: text,
            owner: user.uid,
            date: Date.now()
        };

        Chats.send($stateParams.chat, message);

        for (var i = 0; i < usersArray.length; i++) {
            if (usersArray[i].id !== user.uid) {
                Users.sendNotif(usersArray[i].id, { // add chat title
                    title: 'Nouveau Message de ' + vm.user.username + ' sur .',
                    user: user.uid,
                    type: 'chat',
                    id: $stateParams.chat,
                    new: true
                });
            }
        }
        vm.messageTxt = '';
    };

    vm.getUser = function(userId) {
        return Users.getInfos(userId);
    };
});
