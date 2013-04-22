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

    function pauseRendering() {
        renderingPaused = true;
    }

    function resumeRendering() {
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

            coneMesh.visible = true;
            coneMesh.rotation.z = -Math.PI / 180 * (90 - declination);
            coneMesh.rotation.y = Math.PI / 180 * (rightAscension);

            renderScene();
        }

        function hideCone() {
            if (_.isUndefined(coneMesh)) return;
            coneMesh.visible = false;
            renderScene();
        }

        $.getJSON('./data/observations.json', function (observations) {
            var sortedObservations = _.chain(observations).keys().sortBy(function (startDate) {
                return startDate;
            });

            var firstObservationStartTime = sortedObservations.first().value();
            var lastObservationStartTime = sortedObservations.last().value();
            var firstObservation = observations[firstObservationStartTime];

            function updateDisplayedObservationInformation(observation) {
                $('#target').text(observation.target);
                $('#rightAscension').text(observation.rightAscension);
                $('#declination').text(observation.declination);
                $('#startTime').text(moment.unix(observation.startTime).format('YYYY-MM-DD HH:mm:ss'));
                $('#endTime').text(moment.unix(observation.endTime).format('YYYY-MM-DD HH:mm:ss'));
                $('#revolution').text(observation.revolution);
            }

            function hideDisplayedObservationInformation() {
                $('#target').text('No observation');
                $('#rightAscension').text('No observation');
                $('#declination').text('No observation');
                $('#startTime').text('No observation');
                $('#endTime').text('No observation');
                $('#revolution').text('No observation   ' +
                    '');
            }

            var earliestObservationDate = moment.unix(firstObservationStartTime).toDate();
            var latestObservationDate = moment.unix(lastObservationStartTime).toDate();

            function updateMinuteSliderToDisplay(date) {
                $("#minute-slider").slider('value', date.getHours() * 60 + date.getMinutes());
            }

            function updateMonthDaySliderToDisplay(date) {
                $("#month-day-slider").slider('value', date.getDate());
                $("#month-day-slider").slider('option', 'max', moment(date).daysInMonth());
                updateMinuteSliderToDisplay(date);
            }

            function updateMonthSliderToDisplay(date) {
                $("#month-slider").slider('value', date.getMonth() + 1);
                updateMonthDaySliderToDisplay(date);
            }

            function updateYearSliderToDisplay(date) {
                $("#year-slider").slider('value', date.getFullYear());
                updateMonthSliderToDisplay(date);
            }

            var currentDate = earliestObservationDate;

            $("#year-slider").slider({
                value: earliestObservationDate.getFullYear(),
                min: earliestObservationDate.getFullYear(),
                max: latestObservationDate.getFullYear(),
                start: pauseRotation,
                stop: resumeRotation,
                slide: function (event, ui) {
                    var currentYear = ui.value;
                    var currentYearIsEarliest = currentYear == earliestObservationDate.getFullYear();
                    currentDate = currentYearIsEarliest ? earliestObservationDate : new Date(currentYear, 0, 1, 0, 0, 0);
                    updateMonthSliderToDisplay(currentDate);
                    updateDisplayTo(currentDate);
                }
            });

            $("#month-slider").slider({
                value: 1,
                min: 1,
                max: 12,
                start: pauseRotation,
                stop: resumeRotation,
                slide: function (event, ui) {
                    var currentMonth = ui.value - 1;
                    var currentYear = currentDate.getFullYear();
                    var currentYearIsEarliestYear = currentYear == earliestObservationDate.getFullYear();

                    var earliestMonth = earliestObservationDate.getMonth();

                    if (currentYearIsEarliestYear && currentMonth < earliestMonth) {
                        event.cancel();
                        return;
                    }

                    var currentYearIsLatestYear = currentYear == latestObservationDate.getFullYear();

                    if (currentYearIsLatestYear && currentMonth > latestObservationDate.getMonth()) {
                        event.cancel();
                        return;
                    }

                    var currentMonthIsEarliest = currentYearIsEarliestYear && currentMonth == earliestMonth;
                    currentDate = currentMonthIsEarliest ? earliestObservationDate : new Date(currentYear, currentMonth, 1, 0, 0, 0);

                    updateMonthDaySliderToDisplay(currentDate);
                    updateDisplayTo(currentDate);
                }
            });

            $("#month-day-slider").slider({
                value: 1,
                min: 1,
                max: 31,
                start: pauseRotation,
                stop: resumeRotation,
                slide: function (event, ui) {
                    var currentDayOfMonth = ui.value;
                    var currentYear = currentDate.getFullYear();
                    var currentMonth = currentDate.getMonth();
                    var currentYearAndMonthAreEarliest = currentYear == earliestObservationDate.getFullYear() && currentMonth == earliestObservationDate.getMonth();

                    var earliestDayOfMonth = earliestObservationDate.getDate();

                    if (currentYearAndMonthAreEarliest && currentDayOfMonth < earliestDayOfMonth) {
                        event.cancel();
                        return;
                    }

                    var currentYearAndMonthIsLatest = currentYear == latestObservationDate.getFullYear() && currentMonth == latestObservationDate.getMonth();

                    if (currentYearAndMonthIsLatest && currentDayOfMonth > latestObservationDate.getDate()) {
                        event.cancel();
                        return;
                    }

                    var currentDayOfMonthIsEarliest = currentYearAndMonthAreEarliest && currentDayOfMonth == earliestDayOfMonth;
                    currentDate = currentDayOfMonthIsEarliest ? earliestObservationDate : new Date(currentYear, currentMonth, currentDayOfMonth, 0, 0, 0);

                    updateMinuteSliderToDisplay(currentDate);
                    updateDisplayTo(currentDate);
                }
            });

            function getMinuteOfDayOn(date) {
                return date.getHours() * 60 + date.getMinutes();
            }

            $("#minute-slider").slider({
                value: 0,
                step: 10,
                min: 0,
                max: 1439,
                start: pauseRotation,
                stop: resumeRotation,
                slide: function (event, ui) {
                    var currentMinuteOfDay = ui.value;
                    var currentYear = currentDate.getFullYear();
                    var currentMonth = currentDate.getMonth();
                    var currentDayOfMonth = currentDate.getDate();
                    var currentDateIsEarliest = currentYear == earliestObservationDate.getFullYear()
                        && currentMonth == earliestObservationDate.getMonth()
                        && currentDayOfMonth == earliestObservationDate.getDate();

                    var earliestMinuteOfDay = getMinuteOfDayOn(earliestObservationDate);

                    if (currentDateIsEarliest && currentMinuteOfDay < earliestMinuteOfDay) {
                        event.cancel();
                        return;
                    }

                    var currentDateIsLatest = currentYear == latestObservationDate.getFullYear()
                        && currentMonth == latestObservationDate.getMonth()
                        && currentDayOfMonth == latestObservationDate.getDate();

                    if (currentDateIsLatest && currentMinuteOfDay > getMinuteOfDayOn(latestObservationDate)) {
                        event.cancel();
                        return;
                    }

                    var currentMinuteOfDayIsEarliest = currentDateIsEarliest && currentMinuteOfDay == earliestMinuteOfDay;
                    currentDate = currentMinuteOfDayIsEarliest ? earliestObservationDate : new Date(currentYear, currentMonth, currentDayOfMonth, Math.floor(currentMinuteOfDay / 60), currentMinuteOfDay % 60, 0);

                    updateDisplayTo(currentDate);
                }
            });

            function getObservationAt(currentDate) {
                var currentSecondsSinceEpoch = currentDate.getTime() / 1000;
                var observation = _.find(observations, function (observation, startTime) {
                    return startTime <= currentSecondsSinceEpoch && currentSecondsSinceEpoch <= observation.endTime;
                });
                return observation;
            }

            function updateDisplayTo(currentDate) {
                var observation;

                updateDisplayedCurrentTimeTo(currentDate);
                observation = getObservationAt(currentDate);

                if (_.isUndefined(observation)) {
                    hideCone();
                    hideDisplayedObservationInformation();
                } else {
                    updateCone(observation);
                    updateDisplayedObservationInformation(observation);
                }
            }

            updateYearSliderToDisplay(currentDate);
            updateDisplayedCurrentTimeTo(currentDate);
            updateDisplayedObservationInformation(firstObservation);
            updateCone(firstObservation);
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

    function updateDisplayedCurrentTimeTo(date) {
        $('#currentTime').text(moment(date).format('HH:mm D MMM YYYY'));
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