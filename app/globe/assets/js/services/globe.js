angular.module('nusic.app.globe').service('globe', function(continents, country, coast) {
    
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

           function modelLoader() {
               loader = new THREE.JSONLoader();
               loader.load({ model:pointModel, callback: function(g) {
                   pointGeo = g;
                   gridLoader()
               }});
           }
           function gridLoader() {
               loader = new THREE.JSONLoader();
               loader.load({ model: gridModel, callback: function(g) {
                   gridGeo = g;
                   init();
                   createPoints();
               }});
           }

           function init() {
               var Shaders2 = {
                   'atmosphere' : {
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

                   'continents' : {
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
               scene.addObject(loadTriMesh(continents.getContinents(), continentsMaterial));

               scene.addObject(loadLineMesh(country.getCountries(),
                   new THREE.LineBasicMaterial({
                       linewidth: 1,
                       color: 0xffffff, opacity: 1
                   }), 0.1));

               scene.addObject(loadLineMesh(coast.getCoast(),
                   new THREE.LineBasicMaterial({
                       linewidth: 1,
                       color: 0xffffff, opacity: 1
                   }), 0.1));

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

               container.addEventListener('mouseover', function() {
                   overRenderer = true;
               }, false);

               container.addEventListener('mouseout', function() {
                   overRenderer = false;
               }, false);

               animate();
           }
       /* Load a triangle mesh (continents), spherize and scale it to globe size */
       function loadTriMesh(loader, material) {
           var coords = loader.children[0].children[0].attributes.Vertex.elements;
           var lineGeo = new THREE.Geometry();
           var i = 0;
           var lines = [];
           for (i=0; i<coords.length; i+=3) {
               lines.push(new THREE.Vector3(coords[i], coords[i+1], coords[i+2]));
           }
           lines = spherizeTris(lines, 1/64);
           for (i=0; i<lines.length; i++) {
               lineGeo.vertices.push(new THREE.Vertex(lines[i]));
           }
           for (i=0; i<lines.length; i+=3) {
               lineGeo.faces.push(new THREE.Face3(i, i+1, i+2, null, null));
           }
           lineGeo.computeCentroids();
           lineGeo.computeFaceNormals();
           lineGeo.computeVertexNormals();
           lineGeo.computeBoundingSphere();
           var lineMesh = new THREE.Mesh(lineGeo, material);
           lineMesh.type = THREE.Triangles;
           lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000315;
           lineMesh.rotation.x = -Math.PI/2;
           lineMesh.rotation.z = Math.PI;
           lineMesh.matrixAutoUpdate = false;
           lineMesh.doubleSided = true;
           lineMesh.updateMatrix();
           return lineMesh;
       }

       /* Load an outline mesh (country borders, continent outlines), spherize
        * and scale it to globe size */
       function loadLineMesh(loader, material, offset) {
           var coords = loader.children[0].children[0].attributes.Vertex.elements;
           var lines = [];
           for (i=0; i<coords.length; i+=3) {
               lines.push(new THREE.Vector3(coords[i], coords[i+1], coords[i+2]));
           }
           lines = spherizeLines(lines, 1/64);
           var lineGeo = new THREE.Geometry();
           for (var i=0; i<lines.length; i++) {
               lineGeo.vertices.push(new THREE.Vertex(lines[i]));
           }
           var lineMesh = new THREE.Line(lineGeo, material);
           lineMesh.type = THREE.Lines;
           lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000315 + offset*0.0000001;
           lineMesh.rotation.x = -Math.PI/2;
           lineMesh.rotation.z = Math.PI;
           lineMesh.matrixAutoUpdate = false;
           lineMesh.updateMatrix();
           return lineMesh;
       }

       function createPoints() {

               var subgeo = new THREE.Geometry();

               for (i = 0; i < gridGeo.vertices.length; i ++) {
                   var x = gridGeo.vertices[i].position.x;
                   var y = gridGeo.vertices[i].position.y;
                   var z = gridGeo.vertices[i].position.z;


                   var r;
                   var theta;
                   var phi;
                   theta = Math.acos(y/200)/Math.PI;
                   phi = ((Math.atan2(z,-x))+Math.PI)/(Math.PI*2);
                   addPoint(x,y,z,phi,theta, subgeo);
               }

               if (pointType == ('sphere')){
                   subgeo.computeCentroids();
                   subgeo.computeFaceNormals();
                   subgeo.computeVertexNormals();
               }

               this._baseGeometry = subgeo;

               this.shader = Shaders['data'];
               this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms);

               this.uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir+'worldMask' + '.jpg');
               this.uniforms['textureData'].texture = THREE.ImageUtils.loadTexture(imgDir+'worldDataSample' + '.jpg');
               this.uniforms['extrudeMin'].value = pointExtrudeRange[0];
               this.uniforms['extrudeMax'].value = pointExtrudeRange[1];

               this.material = new THREE.MeshShaderMaterial({

                   uniforms: this.uniforms,
                   vertexShader: this.shader.vertexShader,
                   fragmentShader: this.shader.fragmentShader,
                   color: 0xffffff,
                   vertexColors: THREE.FaceColors

               });

               this.points = new THREE.Mesh(this._baseGeometry, this.material);
               this.points.doubleSided = false;
               scene.addObject(this.points);
           }

           function addPoint(x,y,z,u,v, subgeo) {

               point.position.x = x;
               point.position.y = y;
               point.position.z = z;

               point.scale.set(pointScale, pointScale, 1);

               point.lookAt(mesh.position);

               point.updateMatrix();

               var i,j;
               for (i = 0; i < point.geometry.faces.length; i++) {

                   for (j = 0; j < point.geometry.faces[i].vertexNormals.length; j++) {

                       var len = point.geometry.faces[i].vertexNormals[j].length();
                       point.geometry.faces[i].vertexNormals[j] = new THREE.Vector3(x/200*len,y/200*len,z/200*len);

                   }

               }
               for (i = 0; i < point.geometry.faceVertexUvs[0].length; i++) {

                   for (j = 0; j < point.geometry.faceVertexUvs[0][i].length; j++) {
                       point.geometry.faceVertexUvs[0][i][j] = new THREE.UV( u,v );
                   }

               }
               GeometryUtils.merge(subgeo, point);
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

           this.createPoints = createPoints;
           this.renderer = renderer;
           this.scene = scene;
           this.animate = animate;
           this.modelLoader = modelLoader;
           this.init = init;
           return this;




   };
});