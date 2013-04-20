var camera, scene, renderer;
var celestialSphere, celestialSphereMaterial;
var celestialSphereMesh,celestialEquator, equatorLine;

$(function () {


    init();
    animate();

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
        celestialEquator.vertices.splice(0,1);
        equatorLine = new THREE.Line(celestialEquator, new THREE.LineBasicMaterial({color: 0x000000}));

        universe.add(equatorLine);

//        equatorMesh.rotation.x = 85* Math.PI/180;

        universe.rotation.x = 85* Math.PI/180;

//        scene.add(equatorMesh);
        scene.add(universe);

        renderer = new THREE.CanvasRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

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