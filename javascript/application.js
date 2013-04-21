var CELESTIAL_RADIUS = 300;

$(function () {
    var camera, scene, renderer, rotationPaused, renderingPaused;

    rotationPaused = false;
    renderingPaused = false;

    init();
    animate();

    function createParticle(particleBasicMaterial, x, y, z) {
        var particle = new THREE.Particle(particleBasicMaterial);
        particle.position.set(x, y, z);

        return particle;
    }

    function createLineFromOrigin(x, y, z, material) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(x, y, z));

        return new THREE.Line(geometry, material);
    }

    function createEarth() {
        var sphereGeometry = new THREE.SphereGeometry(10, 50, 50);
        return new THREE.Mesh(sphereGeometry, new THREE.MeshNormalMaterial({ color: 0x3333FF }));
    }

    function createCelestialSphere(celestialRadius) {
        var sphereGeometry = new THREE.SphereGeometry(celestialRadius, 50, 50);
        return new THREE.Mesh(sphereGeometry, new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.0, wireframe: true, color: 0xCC0000 }));
    }

    function createEquator(celestialRadius) {
        var circleGeometry = new THREE.CircleGeometry(celestialRadius, 30);
        circleGeometry.vertices.splice(0, 1);

        var equator = new THREE.Line(circleGeometry, new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 5}));
        equator.rotation.x = 90 * Math.PI / 180;

        return equator;
    }

    function createVernalEquinox() {
        return createLineFromOrigin(CELESTIAL_RADIUS, 0, 0, new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 10}));
    }

    function createCelestialNorthPole() {
        return createLineFromOrigin(0, CELESTIAL_RADIUS, 0, new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 10}));
    }

    function renderScene() {
        if (renderingPaused)return;
        renderer.render(scene, camera);
    }

    function pauseRendering(){
        renderingPaused = true;
    }

    function resumeRendering(){
        renderingPaused = false;
        renderScene();
    }

    function init() {
        var coneMesh;

        camera = new THREE.OrthographicCamera(window.innerWidth / -4, window.innerWidth / 4, window.innerHeight / 2, window.innerHeight / -2, -2000, 1000);
        camera.position.y = 100;

        scene = new THREE.Scene();

        var universe = new THREE.Object3D();

        universe.add(createEarth());
        universe.add(createCelestialSphere(CELESTIAL_RADIUS));
        universe.add(createEquator(CELESTIAL_RADIUS));
        universe.add(createVernalEquinox());
        universe.add(createCelestialNorthPole());

        var particleBasicMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 10
        });

        function drawTarget(target) {
            var rightAscension = parseInt(target.rightAscension);
            var declination = parseInt(target.declination);
            var x = getX(CELESTIAL_RADIUS, rightAscension, parseInt(declination));
            var y = getY(CELESTIAL_RADIUS, rightAscension, parseInt(declination));
            var z = getZ(CELESTIAL_RADIUS, rightAscension, parseInt(declination));
            universe.add(createParticle(particleBasicMaterial, x, y, z));

            renderScene();
        }

        $.getJSON('./data/targets.json', function (targets) {
            pauseRendering();

            _.each(_.keys(targets), function (targetName) {
                var target = targets[targetName];
                drawTarget(target);
            });

            resumeRendering();
        });

        function initializeCone() {
            var coneGeometry = new THREE.CylinderGeometry(0, 10, -CELESTIAL_RADIUS, 50, 50, false);
            coneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, CELESTIAL_RADIUS / 2, 0))

            coneMesh = new THREE.Mesh(coneGeometry, new THREE.MeshNormalMaterial({ color: 0xFFFFFF }));
            coneMesh.overdraw = true;
            universe.add(coneMesh);
        }

        function updateCone(observation) {
            var rightAscension = observation.rightAscension;
            var declination = observation.declination;

            var coneCentreRadius = CELESTIAL_RADIUS / 2;
            var x = getX(coneCentreRadius, rightAscension, declination);
            var y = getY(coneCentreRadius, rightAscension, declination);
            var z = getZ(coneCentreRadius, rightAscension, declination);

            if (_.isUndefined(coneMesh)) {
                initializeCone();
            }

            coneMesh.rotation.z = -Math.PI / 180 * (90 - declination);
            coneMesh.rotation.y = Math.PI / 180 * (rightAscension);

            renderScene();
        }

        $.getJSON('./data/observations.json', function (observations) {
            var sortedObservations = _.chain(observations).keys().sortBy(function (startDate) {
                return startDate;
            });

            var firstObservationStartTime = sortedObservations.first().value();
            var lastObservationStartTime = sortedObservations.last().value();

            function updateDisplayedObservationInformation(observation) {
                $('#target').text(observation.target);
                $('#rightAscension').text(observation.rightAscension);
                $('#declination').text(observation.declination);
                $('#startTime').text(moment.unix(observation.startTime).format('YYYY-MM-DD HH:mm:ss'));
                $('#endTime').text(moment.unix(observation.endTime).format('YYYY-MM-DD HH:mm:ss'));
                $('#revolution').text(observation.revolution);
            }

            $("#slider").slider({
                step: 3600,
                min: parseInt(firstObservationStartTime),
                max: parseInt(lastObservationStartTime),
                start: pauseRotation,
                stop: resumeRotation,
                slide: function (event, ui) {
                    var currentSecondsSinceEpoch = ui.value;
                    updateDisplayedCurrentTime(currentSecondsSinceEpoch);
                    var observation = _.find(observations, function (observation, startTime) {
                        return startTime <= currentSecondsSinceEpoch && observation.endTime >= currentSecondsSinceEpoch;
                    });

                    updateDisplayedObservationInformation(observation);

                    if (!_.isUndefined(observation)) {
                        updateCone(observation);
                    }
                }
            });

            updateDisplayedCurrentTime(firstObservationStartTime);
            updateDisplayedObservationInformation(observations[firstObservationStartTime]);
            updateCone(observations[firstObservationStartTime]);
        });

        scene.add(universe);

        renderer = new THREE.CanvasRenderer();
        renderer.setSize(window.innerWidth / 2, window.innerHeight);

        $('#visualization').append(renderer.domElement);

    }

    function pauseRotation() {
        rotationPaused = true;
    }

    function resumeRotation() {
        rotationPaused = false;
    }

    function updateDisplayedCurrentTime(currentSecondsSinceEpoch) {
        var date = moment.unix(currentSecondsSinceEpoch);
        $('#currentTime').text(date.format('HH:mm D MMM YYYY'));
    }

    function getX(radius, theta, phi) {
        return radius * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
    }

    function getY(radius, theta, phi) {
        return radius * Math.sin(phi * Math.PI / 180);
    }

    function getZ(radius, theta, phi) {
        return -1 * radius * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
    }

    var nextRotationDegree = 0;

    function getNextRotationDegree() {
        return nextRotationDegree == 359 ? (nextRotationDegree = 0) : (nextRotationDegree = nextRotationDegree + 1);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (rotationPaused) return;

        camera.lookAt(scene.position);

        var timer = Math.PI / 180 * getNextRotationDegree();

        camera.position.x = Math.floor(Math.cos(timer) * 500);
        camera.position.z = Math.floor(Math.sin(timer) * 500);

        renderScene();
    }
});