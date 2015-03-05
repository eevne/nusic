angular.module('nusic.app.globe').service('globe', function (continents, country, coast, atmosphere, data, earth, $window) {
    var AUTOROTATE_DELAY = 5000;
    var AUTOROTATE_RESUME_DELAY = 5000;
    var animDuration = 3000; // carousel anim duration
        var  projector = new THREE.Projector();
    var lat, lon;
    var startTime;
    var currentLocation;
    var locations = [];
    var rotation = { x: 0, y: 0 },
        target = { x: Math.PI * 3 / 2, y: Math.PI / 6.0 },
        targetOnDown = { x: 0, y: 0 }, startPoint = {x:0, y:0};
    
    var distance = 100000, distanceTarget = 100000;
    var camera = new THREE.Camera(30, $window.innerWidth / $window.innerHeight, 1, 10000);
    camera.position.z = distance;
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    renderer.setClearColorHex(0x000000, 0.0);
    renderer.setSize($window.innerWidth, $window.innerHeight);
var autoRotate = true;
    renderer.domElement.style.position = 'absolute';

    var resizeGlobe_ = function () {
        camera.aspect = $window.innerWidth / $window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize($window.innerWidth, $window.innerHeight);
    };

    $window.addEventListener('resize', resizeGlobe_, false);

    this.createGlobe = function (container) {


        var scene, sceneAtmosphere;
        var vector;
        var overRenderer;
        var transform;

        var curZoomSpeed = 0;

        var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };



        var PI_HALF = Math.PI / 2;


        function init() {

            container.style.color = '#fff';
            container.style.font = '13px/20px Arial, sans-serif';
            vector = new THREE.Vector3();

            scene = new THREE.Scene();
            sceneAtmosphere = new THREE.Scene();


            data.getData().then(function (data) {
                var coastData = data[0].data;
                var continentsData = data[1].data;
                var countriesData = data[2].data;
                scene.addObject(coast.create(coastData));
                scene.addObject(continents.create(continentsData));
                scene.addObject(country.create(countriesData));
            });

            scene.addObject(earth.create());
            sceneAtmosphere.addObject(atmosphere.create());
            transform = THREE.Matrix4.makeInvert(scene.matrix);

            container.appendChild(renderer.domElement);

            container.addEventListener('mousedown', onMouseDown, false);

            container.addEventListener('mouseover', function () {
                overRenderer = true;
            }, false);

            container.addEventListener('mouseout', function () {
                overRenderer = false;
            }, false);

            animate();

            addMarker('1','1','1',{},0.0,0.0);
        }

        function onMouseDown(event) {
            event.preventDefault();

            container.addEventListener('mousemove', onMouseMove, false);
            container.addEventListener('mouseup', onMouseUp, false);
            container.addEventListener('mouseout', onMouseOut, false);

            mouseOnDown.x = -event.clientX;
            mouseOnDown.y = event.clientY;

            targetOnDown.x = target.x;
            targetOnDown.y = target.y;

            container.style.cursor = 'move';
        }

        function onMouseMove(event) {
            mouse.x = -event.clientX;
            mouse.y = event.clientY;

            var zoomDamp = distance / 1000;

            target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
            target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

            target.y = target.y > PI_HALF ? PI_HALF : target.y;
            target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
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

        function zoom(delta) {
            distanceTarget -= delta;
            distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
            distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }

        function render() {
            zoom(curZoomSpeed);
            resetMarkers();
            var totald = 0;
            var isnf = 0;
            var dist;
            distance += (distanceTarget - distance) * 0.06;
            if (autoRotate && currentLocation) {
                // Move between current location and the carousel target location
                var currentTime = new Date().getTime();
                var tf = Math.min(1, (currentTime - startTime) / animDuration);
                var ttf = -Math.cos(tf*Math.PI)*0.5 + 0.5;

                rotation.x = startPoint.x * (1-ttf) + target.x * ttf;
                rotation.y = startPoint.y * (1-ttf) + target.y * ttf;

                var dy = target.y-rotation.y;
                var dx = target.x-rotation.x;
                var d = Math.sqrt(dx*dx + dy*dy);

                var totaldx = target.x-startPoint.x;
                var totaldy = target.y-startPoint.y;
                totald = Math.sqrt(totaldx*totaldx + totaldy*totaldy);
                var f = d/totald;

                var nf = 2*(f-0.5);
                isnf = Math.pow(-Math.cos(f*Math.PI*2)*0.5+0.5, 0.33);
                dist = distance;

                if (d <= 0.04) {
                    currentLocation.marker.setAttribute('current', 'true');
                }


            } else {
                console.log('here');
                if(locations.length > 0) {
                    // move toward target location (mouse drag listener moves target)
                    rotation.x += (target.x - rotation.x) * 0.2;
                    rotation.y += (target.y - rotation.y) * 0.2;

                    var closestLocation = locations[0];
                    var dy = closestLocation.y - rotation.y;
                    var dx = closestLocation.x - rotation.x;
                    var d = Math.sqrt(dx * dx + dy * dy);

                    for (var i = 1; i < locations.length; i++) {
                        var location = locations[i];
                        var ldy = location.y - rotation.y;
                        var ldx = location.x - rotation.x;
                        var ld = Math.sqrt(ldx * ldx + ldy * ldy);
                        if (ld < d) {
                            dx = ldx;
                            dy = ldy;
                            d = ld;
                            closestLocation = location;
                        }
                    }

                    if (closestLocation == currentLocation && d <= 0.1) {
                        currentLocation.marker.setAttribute('current', 'true');
                    }
                }
            }


            rotation.x += (target.x - rotation.x) * 0.1;
            rotation.y += (target.y - rotation.y) * 0.1;
            distance += (distanceTarget - distance) * 0.3;

            camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
            camera.position.y = distance * Math.sin(rotation.y);
            camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

            vector.copy(camera.position);

            // move camera to correct height and orientation
            // rotate scene and atmosphere to wanted orientation

            var nearY = -(1200-250)/7;
            var nearTY = (1200-250)/0.7;
            var nearPosZ = 250 - (1200-250)/200;
            var f = (dist - 250) / (1200-250);

            camera.position.z = f * dist + (1-f) * nearPosZ;
            camera.position.y = Math.pow((1-f), 4) * nearY;
            camera.fov = 30 + isnf * totald * 2;
            camera.updateProjectionMatrix();
            camera.target.position.y = Math.pow((1-f), 10) * nearTY;
            scene.rotation.y = -rotation.x;
            scene.rotation.x = rotation.y;
            scene.updateMatrix();
            sceneAtmosphere.rotation.y = -rotation.x;
            sceneAtmosphere.rotation.x = rotation.y;
            sceneAtmosphere.updateMatrix();

            vector.copy(camera.position);
updateMarkers();

            renderer.clear();
            renderer.render(scene, camera);
            renderer.render(sceneAtmosphere, camera);
        }
        
        function goTo(location)
        {
            currentLocation = location;
            startTime = new Date().getTime();
            startPoint.x = rotation.x;
            startPoint.y = rotation.y;
            target.y = location.y;
            target.x = location.x;
        }
        
        

        var createMark = function(loc, transform)
        {
            loc.x = -Math.PI/2+loc.coords[1] * Math.PI/180;
            loc.y = loc.coords[0] * Math.PI/180;
            loc.point = createPoint(transform, loc.coords[0], loc.coords[1]);
            loc.marker = createMarker(loc.name, loc.locations);
            loc.marker.location = loc;
            loc.marker.onclick = function(ev) {
                goTo(this.location);
                ev.preventDefault();
            };
            loc.point.location = loc;
            loc.point.updateMatrix();
        };

        var createMarker = function(title, list) {
            var marker = document.createElement('div');
            marker.className = 'marker-container';
            var markerIn = document.createElement('div');
            markerIn.className = 'marker';
            marker.appendChild(markerIn);
            var info = document.createElement('div');
            info.className = 'INFORMATIONAL-BOX';
            markerIn.appendChild(info);

            if (list) {
                var siteList = document.createElement('span');
                siteList.className = 'site-list';
                info.appendChild(siteList);
                for (var i=0; i<list.length; i++) {
                    var d = document.createElement('div');
                    d.textContent = list[i].name;
                    siteList.appendChild(d);
                }
            }

            var d = document.createElement('div');
            d.textContent = title;
            info.appendChild(d);

            var tri = document.createElement('div');
            tri.className = 'REDTRIANGLE';
            markerIn.appendChild(tri);
            return marker;
        };

        /* Create point at given lat-lon coords */
        function createPoint(transform, latDeg, lonDeg) {
            var lat = latDeg * Math.PI/180;
            var lon = lonDeg * Math.PI/180;
            var r = 200;
            var p = new THREE.Vector3(
                    -r * Math.cos(lat) * Math.cos(lon),
                    r * Math.sin(lat),
                    r * Math.cos(lat) * Math.sin(lon)
            );
            var m = transform;
            p = m.multiplyVector3(p);
            var geometry = new THREE.Cube(0.1,0.1,0.01,4,4,4);
            var point = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: 0xff0000
            }));
            point.lookAt(p);
            point.position = p;
            point.is_a_point = true;
            return point;
        }

         function addMarker(title, artist, song, location, lat, lon) {
            console.log(title, artist, song, location, lat, lon);
            lat = lat ? lat : 0.00;
            lon = lon ? lon : 0.00;
            if (lat === 0.00 && lon === 0.00) {
                location = 'unknown';
            }
            var marker = {"name": title + " - " + location, "coords": [parseFloat(lat), parseFloat(lon)]};
            createMark(marker, transform);
            console.log(marker);
            locations.push(marker);
            currentLocation = marker;
            goTo(currentLocation);
        }


        function resetMarkers() {
            for (var i=0; i<locations.length; i++) {
                locations[i].marker.setAttribute('current', 'false');
            }
        }

        function updateMarkers() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            var aspect = w/h;
            var w2 = w/2;
            var h2 = h/2;
            var current = null;

            renderer.domElement.style.zIndex = 1000000;

            var mat = new THREE.Matrix4();
            var v = new THREE.Vector3();
            var zeroZ = null;
            var visible = 0;
            for (var i=0; i<locations.length; i++) {
                mat.copy(scene.matrix);
                if (zeroZ == null) {
                    v.set(0,0,0);
                    mat.multiplyVector3(v);
                    projector.projectVector(v, camera);
                    zeroZ = v.z;
                }
                mat.multiplySelf(locations[i].point.matrix);
                v.set(0,0,0);
                mat.multiplyVector3(v);
                projector.projectVector(v, camera);
                var x = w*(v.x+1)/2;
                var y = h-h*(v.y+1)/2;
                var z = v.z - zeroZ;
                var m = locations[i].marker;
                if (y > h+50) {
                    if (m.visible) {
                        m.style.display = 'none';
                        m.visible = false;
                    }
                } else  {
                    if (!m.visible) {
                        m.style.display = 'block';
                        m.visible = true;
                    }
                    m.style.left = x+'px';
                    m.style.top = y+'px';
                    if (currentLocation == locations[i] && currentLocation.marker.getAttribute('current') == 'true') {
                        m.style.zIndex = 10000000;
                    } else {
                        m.style.zIndex = Math.round(1000000 - 1000000*z);
                    }
                    if (distance < 270 && m.style.opacity != 1) {
                        m.style.opacity = 1;
                        m.style.webkitTransform = 'translateZ(0) rotateY(0deg)';
                    }
                    m.firstChild.style.opacity = (1 - (Math.abs(x-(w/2)) / (w/2)));
                    if (m.parentNode == null) {
                        container.appendChild(m);
                    }
                    if (m.style.zIndex < renderer.domElement.style.zIndex) {
                        m.firstChild.style.pointerEvents = 'none';
                    } else {
                        m.firstChild.style.pointerEvents = 'auto';
                    }
                }
            }
        }

        this.renderer = renderer;
        this.scene = scene;
        this.animate = animate;
        this.init = init;
        return this;


    };
});