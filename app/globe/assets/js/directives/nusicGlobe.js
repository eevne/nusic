angular.module('nusic.app.globe').directive('nusicGlobe', function (continents, globe) {
    return {
        restrict: 'E',
        templateUrl: 'globe/assets/partials/nusic-globe.html',
        controller: function () {

        },
        link: function (scope, element) {

            var globe = globe.createGlobe(element[0]);



            globe.animate();
        }
    }

});