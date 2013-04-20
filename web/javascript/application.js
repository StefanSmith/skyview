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

        celestialEquator = new THREE.CircleGeometry(celestialRadius, 30);
        celestialEquator.vertices.splice(0, 1);
        var lineBasicMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 5});
        equatorLine = new THREE.Line(celestialEquator, lineBasicMaterial);
        equatorLine.rotation.x = 90 * Math.PI / 180;

        universe.add(equatorLine);
        var vernalEquinoxMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 10});

        var particleBasicMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 10,
            map: THREE.ImageUtils.loadTexture("./images/star.png"),
            blending: THREE.AdditiveBlending,
            transparent: true
        });

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