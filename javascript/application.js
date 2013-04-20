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

    function CreateLineFromOrigin(materal, x, y, z) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        return new THREE.Line(geometry, materal);
    }

    function init() {

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 500;

        scene = new THREE.Scene();

        var universe = new THREE.Object3D();
        celestialSphere = new THREE.SphereGeometry(200, 30, 30);
        celestialSphereMaterial = new THREE.MeshNormalMaterial({ transparent: false, opacity: 0.25, color: 0xCC0000 });

        celestialSphereMesh = new THREE.Mesh(celestialSphere, celestialSphereMaterial);
        universe.add(celestialSphereMesh);
//        scene.add(celestialSphereMesh);

        celestialEquator = new THREE.CircleGeometry(200, 30);
        celestialEquator.vertices.splice(0, 1);
        var lineBasicMaterial = new THREE.LineBasicMaterial({color: 0x000000});
        equatorLine = new THREE.Line(celestialEquator, lineBasicMaterial);

        universe.add(equatorLine);

        var particleBasicMaterial = new THREE.ParticleBasicMaterial({size: 100, color: 0x000000});
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 20, 45), getY(200, 20, 45), getZ(200, 20, 45)));
//        universe.add(CreateParticle(particleBasicMaterial, getX(200, 0, 45), getY(200, 0, 45), getZ(200, 0, 45)));
        universe.add(CreateLineFromOrigin(lineBasicMaterial, getX(200, 45, 45), getY(200, 45, 45), getZ(200, 45, 45)));
//        universe.add(CreateParticle(particleBasicMaterial, 0, 0, 100));


//        equatorMesh.rotation.x = 85* Math.PI/180;

        universe.rotation.x = 85 * Math.PI / 180;

//        scene.add(equatorMesh);
        scene.add(universe);

        renderer = new THREE.CanvasRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

    }

    function getX(radius, phi, theta) {
        return radius * Math.sin(phi) * Math.cos(theta);
    }

    function getY(radius, phi, theta) {
        return radius * Math.sin(phi) * Math.sin(theta);
    }

    function getZ(radius, phi, theta) {
        return -radius * Math.cos(phi);
    }

    function animate() {

        // note: three.js includes requestAnimationFrame shim
//        requestAnimationFrame(animate);
//
//        mesh.rotation.x += 0.01;
//        mesh.rotation.y += 0.02;

        renderer.render(scene, camera);

    }
});