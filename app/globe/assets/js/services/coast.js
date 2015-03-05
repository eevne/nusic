angular.module('nusic.app.globe').service('coast', function(){

    this.create = function(coasts)
    {
        return loadLineMesh(coasts,
            new THREE.LineBasicMaterial({
                linewidth: 1,
                color: 0xffffff, opacity: 1
            }), 0.1);
    };
});