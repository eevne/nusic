angular.module('nusic.app.globe').directive('nusicGlobe', function (continents, globe) {
    return {
        restrict: 'E',
        templateUrl: 'globe/assets/partials/nusic-globe.html',
        controller: function () {

        },
        link: function (scope, element) {

            var globe3d = globe.createGlobe(element[0]);


            globe3d.init();

            globe3d.animate();
        }
    }

});