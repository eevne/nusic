angular.module('nusic.app.globe').service('atmosphere', function(){
    
    this.create = function(globe){
        var shader = {
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
                '}'
            ].join('\n')
        };

        var material = new THREE.MeshShaderMaterial({

            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });


        var mesh = new THREE.Mesh(globe, material);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
        mesh.flipSided = true;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        return mesh;
    };
});