'use strict';
angular.module('main')
    .controller('InfosCtrl', function($state, user, Users) {
    var vm = this;
    
    vm.user = Users.getInfos(user.uid);

    vm.save = function() {
        vm.user.$save();  
    };
});