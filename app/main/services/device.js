'use strict';
angular.module('main')
    .factory('Device', function() {
    
    var getWidth = function() {
        return $(window).width();   
    };
    var getHeight = function() {
        return $(window).height();   
    };
    
    return {
        getWidth: getWidth,
        getHeight: getHeight
    };
});