var camera, scene, renderer;
var celestialSphere, celestialSphereMaterial;
var celestialSphereMesh, celestialEquator, equatorLine;

$(function () {


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

//        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
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
        celestialSphereMaterial = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, color: 0xCC0000 });

        celestialSphereMesh = new THREE.Mesh(celestialSphere, celestialSphereMaterial);
        universe.add(celestialSphereMesh);
//        scene.add(celestialSphereMesh);

        celestialEquator = new THREE.CircleGeometry(celestialRadius, 30);
        celestialEquator.vertices.splice(0, 1);
        var lineBasicMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 5});
        equatorLine = new THREE.Line(celestialEquator, lineBasicMaterial);
        equatorLine.rotation.x = 90 * Math.PI / 180;

        universe.add(equatorLine);
        var vernalEquinoxMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 10});

//        var particleBasicMaterial = new THREE.ParticleBasicMaterial({size: 5, color: 0x000000});
        var particleBasicMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 10,
            map: THREE.ImageUtils.loadTexture("./images/star.png"),
            blending: THREE.AdditiveBlending,
            transparent: true
        });
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 20, 45), getY(200, 20, 45), getZ(200, 20, 45)));
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 0, 45), getY(200, 0, 45), getZ(200, 0, 45)));
//        universe.add(CreateLineFromOrigin(vernalEquinoxMaterial, getX(200, 0, 0), getY(200, 0, 0), getZ(200, 0, 0)));

        $.getJSON('./data/targets.json', function (targets) {
            console.log(targets);

            _.each(_.keys(targets), function (targetName) {
                var target = targets[targetName];
                var rightAscension = parseInt(target.rightAscension);
                var declination = parseInt(target.declination);

                console.log('Drawing ' + targetName + ': ' + rightAscension + ', ' + declination);

                var x = getX(celestialRadius, rightAscension, parseInt(declination));
                var y = getY(celestialRadius, rightAscension, parseInt(declination));
                var z = getZ(celestialRadius, rightAscension, parseInt(declination));
                console.log('Drawing ' + x + ',' + y + ',' + z);
                universe.add(CreateParticle(particleBasicMaterial, x, y, z));
            });
        });


//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 45, 0), getY(200, 45, 0), getZ(200, 45, 0)));
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 0, 45), getY(200, 0, 45), getZ(200, 0, 45)));
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 45, 45), getY(200, 45, 45), getZ(200, 45, 45)));

//        universe.add(CreateLineFromOrigin(lineBasicMaterial, 200, 0, 0));
//        universe.add(CreateLineFromOrigin(lineBasicMaterial, 0, 200, 0));
//        universe.add(CreateLineFromOrigin(lineBasicMaterial, 0, 0, 200));

//        universe.add(CreateLineFromOrigin(lineBasicMaterial, getX(200, 0, -45), getY(200, 0, -45), getZ(200, 0, -45)));
//        universe.add(CreateParticle(particleBasicMaterial, 0, 0, 100));


//        universe.rotation.x = 85 * Math.PI / 180;

//        scene.add(equatorMesh);
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
//
//        mesh.rotation.x += 0.01;
//        mesh.rotation.y += 0.02;

        renderer.render(scene, camera);

    }
});