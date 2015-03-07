angular.module('nusic.app.globe').service('globe', function (continents, country, coast, atmosphere, data, earth, $window,$log) {

    var countriesObject, coastObject;
    var animDuration = 3000; // carousel anim duration

    var startTime;
    var currentLocation;
    var scene, sceneAtmosphere;
    var vector;
    var overRenderer;
    var transform;

    var curZoomSpeed = 0;

    var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };



    var PI_HALF = Math.PI / 2;

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

    renderer.domElement.style.position = 'absolute';

    var resizeGlobe_ = function () {
        camera.aspect = $window.innerWidth / $window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize($window.innerWidth, $window.innerHeight);
    };

    $window.addEventListener('resize', resizeGlobe_, false);

    var zoom_ = function() {
            distanceTarget -= curZoomSpeed;
            distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
            distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    };
    
    var render_ = function() {
        zoom_();

        var totald = 0;
        var isnf = 0;
        var dist;
        distance += (distanceTarget - distance) * 0.06;
        if (currentLocation) {
            // Move between current location and the carousel target location
            var currentTime = new Date().getTime();
            var tf = Math.min(1, (currentTime - startTime) / animDuration);
            var ttf = -Math.cos(tf * Math.PI) * 0.5 + 0.5;

            rotation.x = startPoint.x * (1 - ttf) + target.x * ttf;
            rotation.y = startPoint.y * (1 - ttf) + target.y * ttf;

            var dy = target.y - rotation.y;
            var dx = target.x - rotation.x;
            var d = Math.sqrt(dx * dx + dy * dy);

            var totaldx = target.x - startPoint.x;
            var totaldy = target.y - startPoint.y;
            totald = Math.sqrt(totaldx * totaldx + totaldy * totaldy);
            var f = d / totald;

            var nf = 2 * (f - 0.5);
            isnf = Math.pow(-Math.cos(f * Math.PI * 2) * 0.5 + 0.5, 0.33);
            dist = distance;

        }


        // move camera to correct height and orientation
        // rotate scene and atmosphere to wanted orientation

        var nearY = -(1200-250)/7;
        var nearTY = (1200-250)/0.7;
        var nearPosZ = 2000 - (1200-2000)/200;
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


        renderer.clear();
        renderer.render(scene, camera);
        renderer.render(sceneAtmosphere, camera);
    };
    
    var animate_ = function () {
        requestAnimationFrame(animate_);
        render_();
    };
    
    var init_ = function init(container) {

        container.style.color = '#fff';
        container.style.font = '13px/20px Arial, sans-serif';
        vector = new THREE.Vector3();

        scene = new THREE.Scene();
        sceneAtmosphere = new THREE.Scene();


        data.getData().then(function (data) {
            var coastData = data[0].data;
            var continentsData = data[1].data;
            var countriesData = data[2].data;

            coastObject = coast.create(coastData);
            countriesObject = country.create(countriesData);
            scene.addObject(coastObject);
            scene.addObject(countriesObject);
            scene.addObject(continents.create(continentsData));
        });

        scene.addObject(earth.create());
        sceneAtmosphere.addObject(atmosphere.create());
        transform = THREE.Matrix4.makeInvert(scene.matrix);

        container.appendChild(renderer.domElement);

//        container.addEventListener('mousedown', onMouseDown, false);
//
//        container.addEventListener('mouseover', function () {
//            overRenderer = true;
//        }, false);
//
//        container.addEventListener('mouseout', function () {
//            overRenderer = false;
//        }, false);

        animate_();
    };
    

    
    this.createGlobe = function (container) {
        init_(container);
//
//        function init() {
//
//            container.style.color = '#fff';
//            container.style.font = '13px/20px Arial, sans-serif';
//            vector = new THREE.Vector3();
//
//            scene = new THREE.Scene();
//            sceneAtmosphere = new THREE.Scene();
//
//
//            data.getData().then(function (data) {
//                var coastData = data[0].data;
//                var continentsData = data[1].data;
//                var countriesData = data[2].data;
//                scene.addObject(coast.create(coastData));
//                scene.addObject(continents.create(continentsData));
//                scene.addObject(country.create(countriesData));
//            });
//
//            scene.addObject(earth.create());
//            sceneAtmosphere.addObject(atmosphere.create());
//            transform = THREE.Matrix4.makeInvert(scene.matrix);
//
//            container.appendChild(renderer.domElement);
//
//            container.addEventListener('mousedown', onMouseDown, false);
//
//            container.addEventListener('mouseover', function () {
//                overRenderer = true;
//            }, false);
//
//            container.addEventListener('mouseout', function () {
//                overRenderer = false;
//            }, false);
//
//            animate();
//        }
//
//        function onMouseDown(event) {
//            event.preventDefault();
//
//            container.addEventListener('mousemove', onMouseMove, false);
//            container.addEventListener('mouseup', onMouseUp, false);
//            container.addEventListener('mouseout', onMouseOut, false);
//
//            mouseOnDown.x = -event.clientX;
//            mouseOnDown.y = event.clientY;
//
//            targetOnDown.x = target.x;
//            targetOnDown.y = target.y;
//
//            container.style.cursor = 'move';
//        }
//
//        function onMouseMove(event) {
//            mouse.x = -event.clientX;
//            mouse.y = event.clientY;
//
//            var zoomDamp = distance / 1000;
//
//            target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
//            target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;
//
//            target.y = target.y > PI_HALF ? PI_HALF : target.y;
//            target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
//        }
//
//        function onMouseUp(event) {
//            container.removeEventListener('mousemove', onMouseMove, false);
//            container.removeEventListener('mouseup', onMouseUp, false);
//            container.removeEventListener('mouseout', onMouseOut, false);
//            container.style.cursor = 'auto';
//        }
//
//        function onMouseOut(event) {
//            container.removeEventListener('mousemove', onMouseMove, false);
//            container.removeEventListener('mouseup', onMouseUp, false);
//            container.removeEventListener('mouseout', onMouseOut, false);
//        }

       

//        function animate() {
//            requestAnimationFrame(animate);
//            render();
//        }




//        this.renderer = renderer;
//        this.scene = scene;
//        this.animate = animate;
//        this.init = init;
        return this;
    };
    
    this.navigateTo = function(latitude, longitude)
    {
        var lat = latitude ? latitude : 0.00;
        var lon = longitude ? longitude : 0.00;

        var location = {
            lat: lat,
            lon: lon,
            x: -Math.PI/2+parseFloat(lon) * Math.PI/180,
            y: parseFloat(lat) * Math.PI/180
        };

        currentLocation = location;
        startTime = new Date().getTime();
        startPoint.x = rotation.x;
        startPoint.y = rotation.y;
        target.y = location.y;
        target.x = location.x;
    };
    
    this.setOutlineColor = function(color)
    {
        coastObject.materials[0].color = new THREE.Color(color);
        countriesObject.materials[0].color = new THREE.Color(color);
    }

    
});