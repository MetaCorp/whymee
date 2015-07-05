'use strict';
angular.module('main')
    .controller('SettingsCtrl', function($state) {

    var vm = this;

    vm.infos = function() {
        $state.go('app.infos');  
    };
    
    vm.account = function() {
        $state.go('app.account');  
    };
    
    vm.pref = function() {
        $state.go('app.pref');  
    };
    
    vm.about = function() {
        $state.go('app.about');  
    };

});
