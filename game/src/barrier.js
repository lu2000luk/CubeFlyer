var obstacleSpeed = 2; // Changing this will impact how quickly obstacles in the game move.
var gapSize = 3; // This determines the size of the gap to create between the floor and ceiling.
import { GameObject } from './game-object.js';
import { getAllObstacles, addObstacle, removeObstacle, scene, difficulty } from './game.js';
import { gameHeight } from './scene.js';
import { destroyObject } from './state-manager.js';

import { currentObstacleColor, roundedObstacles } from './shop.js';

class Barrier extends GameObject {
	constructor() {
		super();
		this.fadeOutRate = 0.01;
	}

	init() {
		// This is hardcoded for now - should be some location off the right side of the screen
		this.location = 15;

		// Creates 2 boxes which will be used for the top and bottom obstacles,
		// the floor will obscure the height of the object so we don't need to modify this much.
		const boxOptions = { width: 1, height: 10, depth: 1 };
		if (roundedObstacles) {
			this.ceilingBox = BABYLON.MeshBuilder.CreateCylinder("ceilingObstacle", { diameter: 1, height: 10 }, scene);
			this.floorBox = BABYLON.MeshBuilder.CreateCylinder("floorObstacle", { diameter: 1, height: 10 }, scene);
		} else {
			this.ceilingBox = BABYLON.MeshBuilder.CreateBox("ceilingObstacle", boxOptions, scene);
			this.floorBox = BABYLON.MeshBuilder.CreateBox("floorObstacle", boxOptions, scene);
		}
		// Materials impact how an object is rendered like color, texture etc.
		let barrierMaterial = new BABYLON.StandardMaterial("Barrier Material", scene);
		switch (currentObstacleColor) {
			case "green":
				barrierMaterial.diffuseColor = BABYLON.Color3.Green();
				break;
			case "yellow":
				barrierMaterial.diffuseColor = BABYLON.Color3.Yellow();
				break;
			case "orange":
				barrierMaterial.diffuseColor = BABYLON.Color3.Orange();
				break;
			case "black":
				barrierMaterial.diffuseColor = BABYLON.Color3.Black();
				break;
			case "white":
				barrierMaterial.diffuseColor = BABYLON.Color3.White();
				break;
			case "blue":
				barrierMaterial.diffuseColor = BABYLON.Color3.Blue();
				break;
			default:
				barrierMaterial.diffuseColor = BABYLON.Color3.Red();
				break;
		}

		this.ceilingBox.material = barrierMaterial;
		this.floorBox.material = barrierMaterial;
		this.assignLocations();

		this.startFlashingEffect(); // Start the flashing effect
	}

	onDestroy() {
		// Remember when destroying an object to remove all meshes it creates from the scene!
		scene.removeMesh(this.ceilingBox);
		scene.removeMesh(this.floorBox);
		removeObstacle(this);
	}

	update(deltaTime) {
		this.location -= deltaTime * obstacleSpeed;

		// Update the players physics:
		this.ceilingBox.position.x = this.location;
		this.floorBox.position.x = this.location;

		if (this.location < -25 && this.ceilingBox.material.alpha > 0) {
			destroyObject(this);
		}

		if (this.location < 0) {
			this.ceilingBox.material.alpha -= this.fadeOutRate;
			this.floorBox.material.alpha -= this.fadeOutRate;

			if (this.ceilingBox.material.alpha <= 0) {
				this.ceilingBox.material.alpha = 0;
				this.floorBox.material.alpha = 0;
				destroyObject(this);
			}
		}
	}

	assignLocations() {
		// Pick a random center point
		let height = -gameHeight + gapSize / 2 + Math.random() * (gameHeight - gapSize / 2) * 2;
		this.ceilingBox.position.y = height + gapSize / 2 + 5;
		this.floorBox.position.y = height - gapSize / 2 - 5;
		this.ceilingBox.position.x = this.location;
		this.floorBox.position.x = this.location;
	}

	testCollision(playerHeight) {
		if (this.location > -1 && this.location < 1) {
			// In the same location as the player
			if (
				playerHeight + 5.5 > this.ceilingBox.position.y || // 5.5 is the half the height of the box + half the height of the player
				playerHeight - 5.5 < this.floorBox.position.y
			) {
				return true;
			}
		}
		return false;
	}

	startFlashingEffect() {
		// This code was not good and i dont have the time to remove it fully...
	}
}

export { Barrier };