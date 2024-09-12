let obstacles = [];

function getAllObstacles() {
	return obstacles;
}

function addObstacle(obstacle) {
	obstacles.push(obstacle);
}

function removeObstacle(obstacle) {
	const index = obstacles.indexOf(obstacle);
	if (index > -1) {
		obstacles.splice(index, 1);
	}
}

import { createScene, updateGame } from './scene.js';

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const scene = createScene(); //Call the createScene function from scene.js

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
	scene.render();
});

scene.registerBeforeRender(function () {
	updateGame();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
	engine.resize();
});

export { scene, engine, canvas, addObstacle, removeObstacle, getAllObstacles };