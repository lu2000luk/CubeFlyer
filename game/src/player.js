var gamepadManager = new BABYLON.GamepadManager();
import { getAllObstacles, addObstacle, removeObstacle, difficulty } from './game.js';
import { GameObject } from './game-object.js';
import { scene, resetDifficulty, increaseDifficulty } from './game.js';
import { createObject, destroyObject, destroyMatchingObjects, testMatchingObjects } from './state-manager.js';
import { Barrier } from './barrier.js';
import { gravity, flightForce } from './constants.js';
import { gameHeight } from './scene.js';
import { mainMenu } from './mainmenu.js';
import { addScore, resetScore } from './hud.js';

import { sendAlert } from './alert.js';

import { currentSpikeColor } from './shop.js';

const logs = true;

var deviceSourceManager;

const minSpawnInterval = 1.5; // Minimum spawn interval to ensure the game is playable
const maxSpawnInterval = 5.0; // Maximum spawn interval for initial difficulty

let obstacleSpawnInterval = 5;

class Player extends GameObject {
	constructor() {
		super();
		this.trailMeshes = [];
		this.trailLength = 10; // Adjust the length of the trail as needed
		this.trailInterval = 0.1; // Time interval between trail segments
		this.trailTimer = 0;
		this.passedObstacles = new Set();
	}

	init() {
		this.obstacleSpawnTimer = 0;
		// A Vector2 is a 2 dimensional vector with X and Y dimension - track velocity with this.
		this.velocity = new BABYLON.Vector3(0, 0);
		this.setupInputs();
		resetDifficulty();

		const cylinderOptions = { diameterTop: 0, diameterBottom: 1, height: 1, tessellation: 24 };
		this.playerMesh = BABYLON.MeshBuilder.CreateCylinder("arrow", cylinderOptions, scene);
		this.playerMaterial = new BABYLON.StandardMaterial("Player Material", scene);
		this.playerMesh.material = this.playerMaterial;

		switch (currentSpikeColor) {
			case "green":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Green();
				break;
			case "yellow":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Yellow();
				break;
			case "pink":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Pink();
				break;
			case "orange":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Orange();
				break;
			case "black":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Black();
				break;
			case "white":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.White();
				break;
			case "purple":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Purple();
				break;
			case "blue":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Blue();
				break;
			case "red":
				this.playerMesh.material.diffuseColor = BABYLON.Color3.Red();
				break;
			default:
				this.playerMesh.material.diffuseColor = BABYLON.Color3.White();
				break;
		}

		this.lastSpeed = 0;
		this.lastObstacleSpawn = 0;
		this.lastDifficulty = 0;

	}

	onDestroy() {
		scene.removeMesh(this.playerMesh);
	}

	update(deltaTime) {
		obstacleSpawnInterval = Math.max(minSpawnInterval, maxSpawnInterval - (difficulty / 10));

		// Update the players physics:
		this.velocity.y += gravity.y * deltaTime;
		this.capVelocity(20);
		this.playerMesh.position.y += this.velocity.y * deltaTime;
		if (this.testGameOver()) {
			this.endGame();
		}

		// Rotate the player based on y velocity
		const maxRotation = Math.PI / 2; // 90 degrees in radians
		const rotationSpeed = 0.1; // Adjust the rotation speed as needed

		const rotationAngle = Math.min(Math.max(this.velocity.y * rotationSpeed, -maxRotation), maxRotation) - 45;
		this.playerMesh.rotation.z = rotationAngle;

		// To simplify game code the Player handles spawning obstacles (this makes it easier to track for collisions without writing a full handler)
		// A side effect of this is that creating or destroying the Player can pause or start the game.
		this.obstacleSpawnTimer -= deltaTime;
		if (this.obstacleSpawnTimer <= 0) {
			this.obstacleSpawnTimer = obstacleSpawnInterval;

			let barrier = new Barrier();
			createObject(barrier);
			addObstacle(barrier)
		}

		// Check passed obstacles
		try {
			this.checkPassedObstacles();
		} catch (e) {
			console.error(e);
		}

		if (Math.floor(this.lastObstacleSpawn) !== Math.floor(obstacleSpawnInterval)) {
			function mapSpawningRate(s) {
				if (s > 4) return "Easy";
				if (s > 3) return "Medium";
				if (s > 2) return "Hard";
				return "Insane";
			}
			this.alertDifficultyChanges("Spawning rate set to " + mapSpawningRate(obstacleSpawnInterval));
			this.lastObstacleSpawn = obstacleSpawnInterval;
		}

		if (Math.floor(this.lastDifficulty) !== Math.floor(difficulty / 10)) {
			this.alertDifficultyChanges("Difficulty changed to " + Math.floor(difficulty / 10));
			this.lastDifficulty = difficulty / 10;
		}
	}

	alertDifficultyChanges(text) {
		sendAlert(text);

		if (logs) {
			console.log(text);
			console.table({
				"Difficulty": difficulty,
				"Obstacle Spawn Interval": obstacleSpawnInterval,
				"Log ID": Math.floor(Math.random() * 1000000),
				"Flight Force": Math.min(flightForce + (difficulty / 10), 10)
			});
		}
	}

	checkPassedObstacles() {
		const playerPositionX = this.playerMesh.position.x;

        // Iterate through all obstacles
        for (let obstacle of getAllObstacles()) {
            if (obstacle.location > playerPositionX && !this.passedObstacles.has(obstacle)) {
                addScore(1);
				this.passedObstacles.add(obstacle);
				increaseDifficulty(0.05);
            }
        }
	}

	endGame() {
		// This is used to identify and remove barrier objects from the scene
		destroyMatchingObjects((gobj) => gobj.location !== undefined);

		mainMenu.visible = true;
		destroyObject(this);
		resetScore();
	}

	testGameOver() {
		let outOfBounds = this.playerMesh.position.y > gameHeight || this.playerMesh.position.y < -gameHeight;

		let collision = testMatchingObjects(
			(gameObject) => gameObject.testCollision !== undefined,
			(gameObject) => gameObject.testCollision(this.playerMesh.position.y)
		);

		if (collision) {
			console.log("IMPACT");
		}

		return outOfBounds || collision;
	}

	onPlayerFlight() {
		const maxFlightForce = 10; // Maximum flight force to ensure the game is playable
		const targetVelocity = Math.min(flightForce + (difficulty / 10), maxFlightForce); // Increment with difficulty but cap it
		const interpolationSpeed = 0.5; // Adjust the interpolation speed as needed

		// Interpolate the velocity towards the target velocity
		this.velocity.y = BABYLON.Scalar.Lerp(this.velocity.y, targetVelocity, interpolationSpeed);
	}

	capVelocity(cap) {
		this.velocity.y = Math.min(cap, Math.max(-cap, this.velocity.y));
	}

	setupInputs() {
		deviceSourceManager = new BABYLON.DeviceSourceManager(scene.getEngine());
		/**
		 * onDeviceConnectedObservable is fired after a device is connected so any code that we
		 * put in here should be able to reliably work against an existing device.
		 *
		 * For onInputChangedObservable, this will only work with Mouse, Touch, and Keyboards because
		 * the Gamepad API currently does not fire input changed events (polling only)
		 */
		deviceSourceManager.onDeviceConnectedObservable.add((deviceSource) => {
			// If Mouse/Touch, add an Observer to change text
			if (
				deviceSource.deviceType === BABYLON.DeviceType.Mouse ||
				deviceSource.deviceType === BABYLON.DeviceType.Touch
			) {
				deviceSource.onInputChangedObservable.add((eventData) => {
					if (eventData.type === "pointerdown" && eventData.inputIndex === BABYLON.PointerInput.LeftClick) {
						this.onPlayerFlight();
					}
				});
			}
			// If Keyboard, add an Observer to change text
			else if (deviceSource.deviceType === BABYLON.DeviceType.Keyboard) {
				deviceSource.onInputChangedObservable.add((eventData) => {
					if (eventData.type === "keydown" && eventData.key === " ") {
						this.onPlayerFlight();
					}
				});
			}
		});

		// This callback is invoked when a new controller is attached:
		gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
			// When a new controller is connected add support for detecting button presses
			gamepad.onButtonDownObservable.add((button, state) => {
				this.onPlayerFlight();
			});
		});
	}
}

export { Player };