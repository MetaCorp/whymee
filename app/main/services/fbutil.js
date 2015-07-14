'use strict';
angular.module('main')
    .factory('FbUtil', function($q, Ref, $firebaseObject, $firebaseArray) {

    var addOrSet = function(arrayRef, obj) {
        var def = $q.defer();
        var array = $firebaseArray(arrayRef);

        array.$loaded(function() {
            var dataExists = array.$value !== null;

            if (!dataExists)
                arrayRef.$set(obj).then(function(ref) { def.resolve(ref); });
            else
                array.$add(obj).then(function(ref) { def.resolve(ref); });
        });

        return def.promise;
    };

    var addOrSetObject = function(arrayRef, obj) {
        var def = $q.defer();
        addOrSet(arrayRef, { 
            infos: obj
        }).then(function(ref) {
            var newObj = $firebaseObject(arrayRef.child(ref.key() + '/infos'));

            newObj.$loaded(function() {
                newObj.id = ref.key();
                newObj.$save();
            });

            def.resolve(ref);
        });

        return def.promise;
    };

    var arrayContainsId = function(arrayRef, id) {
        var def = $q.defer();

        var array = $firebaseArray(arrayRef);

        array.$loaded(function() {
            if (array !== null) {
                for(var i = 0; i < array.length; i++)
                    if (array[i].$value === id)
                        def.resolve(true);
                def.resolve(false);
            }
            else
                def.resolve(false);
        });

        return def.promise;
    };

    var removeIdFromArray = function(arrayRef, id) {
        var def = $q.defer();

        var array = $firebaseArray(arrayRef);

        function ret(data) {
            def.resolve(data);
        }

        array.$loaded(function() {
            for (var i = 0; i < array.length; i++) 
                if (array[i].$value === id) {
                    array.$remove(array[i]).then(ret);
                }
        });

        return def.promise;
    };

    var arrayGetFromId = function(array, id) {
        for(var i = 0; i < array.length; i++)
            if (array[i].user === id)
                return array[i].id;
        return null;
    };

    var getItemsInfosFromIds = function(arrayIdRef, dataRef) {
        var def = $q.defer();
        var arrayId = $firebaseArray(arrayIdRef);

        arrayId.$loaded(function() {
            if(arrayId.$value === null || arrayId.length === 0) 
                def.resolve([]);

            var array = [];

            function ret(data) {
                array.push(data);
                if (array.length === arrayId.length)
                    def.resolve(array);
            }

            for(var i = 0; i < arrayId.length; i++)
            {
                $firebaseObject(dataRef.child(arrayId[i].$value + '/infos')).$loaded(ret);
            }
        });

        return def.promise;
    };

    return {
        addOrSet: addOrSet,
        addOrSetObject: addOrSetObject,
        arrayContainsId: arrayContainsId,
        arrayGetFromId: arrayGetFromId,
        getItemsInfosFromIds: getItemsInfosFromIds,
        removeIdFromArray: removeIdFromArray
    };
});