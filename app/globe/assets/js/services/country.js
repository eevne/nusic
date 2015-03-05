angular.module('nusic.app.globe').service('country', function () {
    this.create = function (countries) {
        return loadLineMesh(countries,
            new THREE.LineBasicMaterial({
                linewidth: 1,
                color: 0xffffff, opacity: 1
            }), 0.1);
    };
});
