'use strict';
angular.module('main')
    .controller('IntroCtrl', function($state, user, Users) {

    var vm = this;

    vm.user = Users.getInfos(user.uid);

    vm.save = function() {
        vm.user.$save();
        $state.go('app.around');
//        Materialize.toast('Bienvenue ' + vm.user.first_name + ' ' + vm.user.last_name + '.', 4000);
    };
});
