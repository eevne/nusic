angular.module('nusic.app.globe').directive('nusicGlobe', function ($window) {
    return {
        restrict: 'E',
        templateUrl: 'globe/assets/partials/nusic-globe.html',
        controller: function () {

        },
        link: function (scope, element) {

            var createEarth_ = function () {
                var geometry = new THREE.SphereGeometry(0.5, 32, 32);
                var material = new THREE.MeshBasicMaterial({
                    color: 0x00ff00
                });
                var mesh = new THREE.Mesh(geometry, material);
                return mesh
            };

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(45, $window.innerWidth / $window.innerHeight, 0.1, 1000);
            camera.position.z = 2;

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize($window.innerWidth, $window.innerHeight);
            element.append(renderer.domElement);


            scene.add(createEarth_());

            renderer.render(scene, camera);
        }
    }

});