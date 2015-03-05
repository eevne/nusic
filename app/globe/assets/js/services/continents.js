angular.module('nusic.app.globe').service('continents',function(){

    this.create = function(continents){
        var shader = {
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normalize( position ));',
                'gl_Position = pos;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'float i = pow(clamp(dot( vNormal, normalize(vec3( 0.0, 2.0, 1.0 ))), 0.0, 1.0), 1.5);',
                'float i2 = 0.8-pow(clamp(dot( vNormal, normalize(vec3( 0.0, -0.0, 1.0 ))), 0.0, 1.0), 1.7);',
                'gl_FragColor = vec4(0.8, 0.85, 0.9, 1.0) * vec4(i*i*i+0.0*clamp(i2,0.0,1.0));',
                'gl_FragColor.a = 1.0;',
                '}'
            ].join('\n')
        };
        var continentsMaterial = new THREE.MeshShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        
        return loadTriMesh(continents, continentsMaterial);
        
        
    }

});