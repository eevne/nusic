angular.module('nusic.app.globe').service('data', function ($http, $q) {

    this.getData = function() {
        var coast = $http.get('/assets/data/coast.json', {cache: true});
        var continents = $http.get('/assets/data/continents.json', {cache: true});
        var countries = $http.get('/assets/data/countries.json', {cache: true});
        
        return $q.all([coast, continents, countries]);
    };
    
    
});