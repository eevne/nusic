angular.module('nusic.app.globe').service('data', function ($http) {

    this.getCoast = function () {
        return $http.get('/assets/data/coast.json', {cache: true});
    };


    this.getContinents = function () {
        return $http.get('/assets/data/continents.json', {cache: true});
    };


    this.getCountries = function () {
        return $http.get('/assets/data/countries.json', {cache: true});
    };
    
    
});