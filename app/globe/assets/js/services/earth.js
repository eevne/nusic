angular.module('nusic.app.globe').service('earth', function () {

    
    this.create = function () {

        var shader = {
            uniforms: {
                'texture': { type: 't', value: 0, texture: null }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'vUv = uv;',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D texture;',
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
                //'gl_FragColor = vec4(vUv,0.,1.);',
                '}'
            ].join('\n')
        };
        
        var geometry = new THREE.Sphere(200, 40, 30);
        
        var material = new THREE.MeshShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            attributes: {

            }
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;
        
        return mesh;
    };
});