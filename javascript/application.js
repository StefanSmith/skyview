$(function () {
    var camera, scene, renderer;
    var geometry, material, mesh;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;

        scene = new THREE.Scene();

        geometry = new THREE.SphereGeometry(200, 30, 30);
        material = new THREE.MeshNormalMaterial({                transparent: false, opacity: 0.25, color: 0xCC0000            });
//        material = new THREE.MeshLambertMaterial({                color: 0xCC0000            });
//        material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        var geometry2 = new THREE.SphereGeometry(100, 30, 30);
        var material2 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

        var mesh2 = new THREE.Mesh(geometry2, material2);
        scene.add(mesh2);

        var celestialEquator = new THREE.CircleGeometry(500, 30);
        var equatorMesh = new THREE.Mesh(celestialEquator, material2);

        celestialEquator.rotation = 25* Math.PI/180;



        scene.add(equatorMesh);

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