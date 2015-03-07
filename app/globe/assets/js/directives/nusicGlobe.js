angular.module('nusic.app.globe').directive('nusicGlobe', function (continents, globe, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'globe/assets/partials/nusic-globe.html',
        controller: function () {

        },
        link: function (scope, element) {

            globe.createGlobe(element[0]);

            
            globe.navigateTo("37", "-120");

            $timeout(function(){

                globe.setOutlineColor(0x00ffff);
                globe.navigateTo("37", "120");
            }, 3000);

            $timeout(function(){

//                globe.setOutlineColor(0x00ffff);
            }, 6000);

        }
    }

});