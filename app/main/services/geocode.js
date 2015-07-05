'use strict';
angular.module('main')
    .factory('Geocode', function($http) {

    var key = 'AIzaSyAGE-XmElT3vNFhPpooB6Z3DC0O5WJuetk';
    var end_point = 'https://maps.googleapis.com/maps/api/geocode/json?language=en&';
    
    var getGeocode = function(location) {
        return $http.get(end_point + 'latlng=' + location.lat + ',' + location.long + '&key=' + key);
    };
    
    var parse = function(location, str) {
        var i;
        
        for (i = 0; i < location.address_components.length &&
               !arrayContains(location.address_components[i].types, str); i++) ;
        
        if (i === location.address_components.length)
            return null;
        else
            return location.address_components[i].long_name;
    };
               
    var arrayContains = function(array, value) {
        for(var i = 0; i < array.length; i++)
            if (array[i] === value)
                return true;
        
        return false;
    };
    
    return {
        get: getGeocode,
        parse: parse
    };
});