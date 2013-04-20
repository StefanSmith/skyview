$(function () {
    var camera, scene, renderer;

    init();
    animate();

    function CreateParticle(particleBasicMaterial, x, y, z) {
        var particle = new THREE.Particle(particleBasicMaterial);
        particle.position.set(x, y, z);
        return particle;
    }

    function CreateLineFromOrigin(material, x, y, z) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        return new THREE.Line(geometry, material);
    }

    function init() {
        var celestialSphere, celestialSphereMaterial;
        var celestialSphereMesh, celestialEquator, equatorLine;
        var coneMesh;

        camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -2000, 1000);
        camera.position.z = 500;
        camera.position.y = 100;

        scene = new THREE.Scene();

        var universe = new THREE.Object3D();

        var earthSphere = new THREE.SphereGeometry(10, 50, 50);
        var earthSphereMaterial = new THREE.MeshNormalMaterial({ color: 0x3333FF });
        var earthSphereMesh = new THREE.Mesh(earthSphere, earthSphereMaterial);
        universe.add(earthSphereMesh);

        var celestialRadius = 300;
        celestialSphere = new THREE.SphereGeometry(celestialRadius, 50, 50);
        celestialSphereMaterial = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.0, wireframe: true, color: 0xCC0000 });

        celestialSphereMesh = new THREE.Mesh(celestialSphere, celestialSphereMaterial);
        universe.add(celestialSphereMesh);

        celestialEquator = new THREE.CircleGeometry(celestialRadius, 30);
        celestialEquator.vertices.splice(0, 1);
        var lineBasicMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 5});
        equatorLine = new THREE.Line(celestialEquator, lineBasicMaterial);
        equatorLine.rotation.x = 90 * Math.PI / 180;

        universe.add(equatorLine);
        var vernalEquinoxMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 10});
        universe.add(CreateLineFromOrigin(vernalEquinoxMaterial, celestialRadius, 0, 0));

        var particleBasicMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 10,
//            map: THREE.ImageUtils.loadTexture("./images/star.png"),
//            blending: THREE.AdditiveBlending,
//            transparent: true
        });

        function drawTarget(target) {
            var rightAscension = parseInt(target.rightAscension);
            var declination = parseInt(target.declination);
            var x = getX(celestialRadius, rightAscension, parseInt(declination));
            var y = getY(celestialRadius, rightAscension, parseInt(declination));
            var z = getZ(celestialRadius, rightAscension, parseInt(declination));
            universe.add(CreateParticle(particleBasicMaterial, x, y, z));
        }

        $.getJSON('./data/targets.json', function (targets) {
            _.each(_.keys(targets), function (targetName) {
                var target = targets[targetName];
                drawTarget(target);
            });
        });

        function initializeCone() {
            var coneGeometry = new THREE.CylinderGeometry(0, 10, -celestialRadius, 50, 50, false);
            coneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, celestialRadius / 2, 0))

            coneMesh = new THREE.Mesh(coneGeometry, new THREE.MeshNormalMaterial({ color: 0xFFFFFF }));
            coneMesh.overdraw = true;
            universe.add(coneMesh);
        }

        function updateCone(observation) {
            var rightAscension = observation.rightAscension;
            var declination = observation.declination;

//            drawTarget(observation);

            var coneCentreRadius = celestialRadius / 2;
            var x = getX(coneCentreRadius, rightAscension, declination);
            var y = getY(coneCentreRadius, rightAscension, declination);
            var z = getZ(coneCentreRadius, rightAscension, declination);

            console.log('Drawing cone with: (right ascension: ' + rightAscension + ', declination: ' + declination + ')');

            if (_.isUndefined(coneMesh)) {
                initializeCone();
            }

            var zRotation = -Math.PI / 180 * (90 - declination);
            coneMesh.rotation.z = zRotation;
            console.log('Rotating on z: ' + zRotation * 180 / Math.PI);
//            coneGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(zRotation));
            var yRotation = Math.PI / 180 * (rightAscension);
            coneMesh.rotation.y = yRotation;
//            console.log('Rotating on y: ' + yRotation * 180 / Math.PI);
//            coneGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(yRotation));
        }

        $.getJSON('./data/observations.json', function (observations) {
            var sortedObservations = _.chain(observations).keys().sortBy(function (startDate) {
                return startDate;
            });

            var firstObservationStartTime = sortedObservations.first().value();
            var lastObservationStartTime = sortedObservations.last().value();

            $("#slider").slider({
                step: 86400,
                min: parseInt(firstObservationStartTime),
                max: parseInt(lastObservationStartTime),
                change: function (event, ui) {
                    var currentSecondsSinceEpoch = ui.value;
                    var observation = _.find(observations, function (observation, startTime) {
                        return startTime <= parseInt(currentSecondsSinceEpoch) && observation.endTime >= parseInt(currentSecondsSinceEpoch);
                    });

                    if (!_.isUndefined(observation)) {
                        updateCone(observation);
                    }
                }
            });

            updateCone(observations[firstObservationStartTime]);
        });

        scene.add(universe);

        renderer = new THREE.CanvasRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

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

    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame(animate);

        camera.lookAt(scene.position);

        var timer = new Date().getTime() * 0.0005;

        camera.position.x = Math.floor(Math.cos(timer) * 200);
        camera.position.z = Math.floor(Math.sin(timer) * 200);

        renderer.render(scene, camera);

    }
});