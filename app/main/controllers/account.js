'use strict';
angular.module('main')
    .controller('AccountCtrl', function(Auth, user, Users) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);

    vm.save = function() {
        vm.uploadAvatar();
        vm.user.$save();  
    };

    vm.deco = function() {
        Auth.$unauth();
    };
    
    vm.loadEnd = function() {
        console.log('vm.myfile:', vm.myfile);
    };

});
