'use strict';
angular.module('main')
    .factory('WorkerService', function($q) {

    var worker = new Worker('workers/MyWorker.js');
    var defer;
    worker.addEventListener('message', function(e) {
        // traitements additionnels ...
        defer.resolve(e.data);
    }, false);

    return {
        processData : function(data){
            console.log('processData:', data);
            defer = $q.defer();
            worker.postMessage(data);
            return defer.promise;
        }
    };
});