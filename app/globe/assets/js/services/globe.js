angular.module('nusic.app.globe').service('globe', function(continents, country, coast, atmosphere, data, $log) {
    
   this.createGlobe = function(container, colorFn){


           colorFn = colorFn || function(x) {
               var c = new THREE.Color();
               c.setHSV( ( 0.6 - ( x * 0.5 ) ), 1.0, 1.0 );
               return c;
           };

           var camera, scene, sceneAtmosphere, renderer, w, h;
           var vector, mesh, atmosphere, point;

           var pointGeo, pointModel, gridGeo, gridModel;
           var gridDensity = 6; // 0-10
           var pointType = 'hex'; // cube || hex || sphere
           var pointScale = 1.1;
           var pointExtrudeRange = [0.01,100];

           gridModel = 'models/gridLand'+gridDensity+'.js';
           if (pointType == 'cube') pointModel = "models/cube.js";
           else if (pointType == 'hex') pointModel = "models/hex.js";
           else pointModel = "models/sphere.js";

           var overRenderer;

           var imgDir = '/assets/images/';

           var curZoomSpeed = 0;

           var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
           var rotation = { x: 0, y: 0 },
               target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
               targetOnDown = { x: 0, y: 0 };

           var distance = 100000, distanceTarget = 100000;

           var PI_HALF = Math.PI / 2;


           function init() {
               var Shaders2 = {
                   'atmosphere': {
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
                           'float intensity = pow( 0.5 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 8.0 );',
                           'gl_FragColor = vec4(1.0);',
                           'gl_FragColor.a = pow(intensity*0.8, 2.0);',
                           '}'
                       ].join('\n')
                   },

                   'continents': {
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
                   }
               };

               data.getCoast().then(function(response)
               {
                   $log.log('ok', response);
               }, function()
               {
                   $log.log('bad');
                   
               });
               container.style.color = '#fff';
               container.style.font = '13px/20px Arial, sans-serif';

               var shader, uniforms, material;
               w = container.offsetWidth || window.innerWidth;
               h = container.offsetHeight || window.innerHeight;

               camera = new THREE.Camera(
                   30, w / h, 1, 10000);
               camera.position.z = distance;

               vector = new THREE.Vector3();

               scene = new THREE.Scene();
               sceneAtmosphere = new THREE.Scene();

               var continentsShader = Shaders2['continents'];
               var continentsUniforms = THREE.UniformsUtils.clone(continentsShader.uniforms);

               var continentsMaterial = new THREE.MeshShaderMaterial({
                   uniforms: continentsUniforms,
                   vertexShader: continentsShader.vertexShader,
                   fragmentShader: continentsShader.fragmentShader
               });
               // add continents on top of black earth sphere
               scene.addObject(continents.create());
               scene.addObject(country.create());
               scene.addObject(coast.create());

               var geometry = new THREE.Sphere(200, 40, 30);

               shader = Shaders['earth'];
               uniforms = THREE.UniformsUtils.clone(shader.uniforms);

               //uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir+'world' + '.jpg');

               material = new THREE.MeshShaderMaterial({
                   uniforms: uniforms,
                   vertexShader: shader.vertexShader,
                   fragmentShader: shader.fragmentShader,
                   attributes: {

                   }
               });

               mesh = new THREE.Mesh(geometry, material);
               mesh.matrixAutoUpdate = false;
               scene.addObject(mesh);

               shader = Shaders['atmosphere'];
               uniforms = THREE.UniformsUtils.clone(shader.uniforms);

               material = new THREE.MeshShaderMaterial({

                   uniforms: uniforms,
                   vertexShader: shader.vertexShader,
                   fragmentShader: shader.fragmentShader

               });

               mesh = new THREE.Mesh(geometry, material);
               mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
               mesh.flipSided = true;
               mesh.matrixAutoUpdate = false;
               mesh.updateMatrix();
               sceneAtmosphere.addObject(mesh);

               point = new THREE.Mesh(pointGeo);

               renderer = new THREE.WebGLRenderer({antialias: true});
               renderer.autoClear = false;
               renderer.setClearColorHex(0x000000, 0.0);
               renderer.setSize(w, h);

               renderer.domElement.style.position = 'absolute';

               container.appendChild(renderer.domElement);

               container.addEventListener('mousedown', onMouseDown, false);

               container.addEventListener('mousewheel', onMouseWheel, false);

               document.addEventListener('keydown', onDocumentKeyDown, false);

               window.addEventListener('resize', onWindowResize, false);

               container.addEventListener('mouseover', function () {
                   overRenderer = true;
               }, false);

               container.addEventListener('mouseout', function () {
                   overRenderer = false;
               }, false);

               animate();
           }

           function onMouseDown(event) {
               event.preventDefault();

               container.addEventListener('mousemove', onMouseMove, false);
               container.addEventListener('mouseup', onMouseUp, false);
               container.addEventListener('mouseout', onMouseOut, false);

               mouseOnDown.x = - event.clientX;
               mouseOnDown.y = event.clientY;

               targetOnDown.x = target.x;
               targetOnDown.y = target.y;

               container.style.cursor = 'move';
           }

           function onMouseMove(event) {
               mouse.x = - event.clientX;
               mouse.y = event.clientY;

               var zoomDamp = distance/1000;

               target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
               target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

               target.y = target.y > PI_HALF ? PI_HALF : target.y;
               target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
           }

           function onMouseUp(event) {
               container.removeEventListener('mousemove', onMouseMove, false);
               container.removeEventListener('mouseup', onMouseUp, false);
               container.removeEventListener('mouseout', onMouseOut, false);
               container.style.cursor = 'auto';
           }

           function onMouseOut(event) {
               container.removeEventListener('mousemove', onMouseMove, false);
               container.removeEventListener('mouseup', onMouseUp, false);
               container.removeEventListener('mouseout', onMouseOut, false);
           }

           function onMouseWheel(event) {
               event.preventDefault();
               if (overRenderer) {
                   zoom(event.wheelDeltaY * 0.3);
               }
               return false;
           }

           function onDocumentKeyDown(event) {
               switch (event.keyCode) {
                   case 38:
                       zoom(100);
                       event.preventDefault();
                       break;
                   case 40:
                       zoom(-100);
                       event.preventDefault();
                       break;
               }
           }

           function onWindowResize( event ) {
               camera.aspect = window.innerWidth / window.innerHeight;
               camera.updateProjectionMatrix();
               renderer.setSize( window.innerWidth, window.innerHeight );
           }

           function zoom(delta) {
               distanceTarget -= delta;
               distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
               distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
           }

           function animate () {
               requestAnimationFrame(animate);
               render();
           }

           function render() {
               zoom(curZoomSpeed);

               rotation.x += (target.x - rotation.x) * 0.1;
               rotation.y += (target.y - rotation.y) * 0.1;
               distance += (distanceTarget - distance) * 0.3;

               camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
               camera.position.y = distance * Math.sin(rotation.y);
               camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

               vector.copy(camera.position);

               renderer.clear();
               renderer.render(scene, camera);
               renderer.render(sceneAtmosphere, camera);
           }


           this.renderer = renderer;
           this.scene = scene;
           this.animate = animate;
           this.init = init;
           return this;




   };
});