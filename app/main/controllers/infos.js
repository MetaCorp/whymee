'use strict';
angular.module('main')
    .controller('InfosCtrl', function($ionicHistory, $state, user, Users) {
    var vm = this;
    
    vm.user = Users.getInfos(user.uid);

    vm.save = function() {
        vm.user.$save();
        $ionicHistory.goBack();
        Materialize.toast('Vos informations ont été enregistrées.', 4000);
    };
});