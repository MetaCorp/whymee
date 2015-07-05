'use strict';
angular.module('main')
    .filter('cdate', function($filter) {

    var days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

    return function(input) {
        var now = new Date();
        var date = new Date(input);

        var prefix = days[date.getDay()];

        if (now.getDay() === date.getDay())
            prefix = 'Aujourd\'hui';
        else if (now.getDay() + 1 === date.getDay())
            prefix = 'Demain';

        return prefix + ' à ' + $filter('date')(input, 'H\'h\'MM');
    };
});