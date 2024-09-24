import { GameObject } from './game-object.js';
import { greetings } from './constants.js';
import { Player } from './player.js';
import { createObject } from './state-manager.js';
import { scene } from './game.js';

import { openShop } from './shop.js';

var gamepadManager = new BABYLON.GamepadManager();

var gaming = false;

var deviceSourceManager;

class MainMenu extends GameObject {
	constructor() {
		super();
	}

	init() {
		this.visible = true;
		this._isVisible = false;
		this.createMainMenu();
		this.setupInputs();
	}

	onDestroy() {}

	update(deltaTime) {
		// Don't do anything here
		if (this._isVisible !== this.visible) {
			this._isVisible = this.visible;
			if (this._isVisible) {
				this.showUI();
			} else {
				this.hideUI();
			}
		}
	}

	onStartGame() {
		if (this.visible) {
			this.visible = false;
			createObject(new Player());
			gaming = true;
		}
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
						this.onStartGame();
					}
				});
			}
			// If Keyboard, add an Observer to change text
			else if (deviceSource.deviceType === BABYLON.DeviceType.Keyboard) {
				deviceSource.onInputChangedObservable.add((eventData) => {
					if (eventData.type === "keydown") {
						if (eventData.key === "b") {
							if (gaming) {
								return;
							}
							openShop();
							return;
						}

						console.log(eventData)

						this.onStartGame();
					}
				});
			}
		});

		// This callback is invoked when a new controller is attached:
		gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
			// When a new controller is connected add support for detecting button presses
			gamepad.onButtonDownObservable.add((button, state) => {
				this.onStartGame();
			});
		});
	}

	createMainMenu() {
		this.hudTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Menu");
	}

	getGreeting() {
		// Pick a random greeting from the list in constants.js
		let val = Math.floor(Math.random() * greetings.length);
		return greetings[val];
	}

	showUI() {
		gaming = false;

		let greeting = this.getGreeting();

		// Create a Text Block that can display the current score
		this.welcomeText = new BABYLON.GUI.TextBlock();
		this.welcomeText.text = "Flying Spike? Game!";
		this.welcomeText.fontFamily = "'Protest Guerrilla', sans-serif";
		this.welcomeText.color = "white";
		this.welcomeText.fontSize = 72;
		this.welcomeText.verticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
		this.welcomeText.horizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
		this.welcomeText.width = 0.5;
		this.welcomeText.height = 0.6;

		this.greetingText = new BABYLON.GUI.TextBlock();
		this.greetingText.text = greeting;
		this.greetingText.fontFamily = "'Protest Guerrilla', sans-serif";
		this.greetingText.color = "white";
		this.greetingText.fontSize = 28;
		this.greetingText.verticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
		this.greetingText.horizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
		this.greetingText.width = 0.5;
		this.greetingText.height = 0.7;

		this.instructionsText = new BABYLON.GUI.TextBlock();
		this.instructionsText.text = "Press any key to play or press B to open shop.";
		this.instructionsText.fontFamily = "'Protest Guerrilla', sans-serif";
		this.instructionsText.color = "#aafffa";
		this.instructionsText.fontSize = 32;
		this.instructionsText.verticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
		this.instructionsText.horizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
		this.instructionsText.width = 0.5;
		this.instructionsText.height = 0.9;

		this.hudTexture.addControl(this.welcomeText);
		this.hudTexture.addControl(this.greetingText);
		this.hudTexture.addControl(this.instructionsText);
	}

	hideUI() {
		this.hudTexture.removeControl(this.welcomeText);
		this.hudTexture.removeControl(this.greetingText);
		this.hudTexture.removeControl(this.instructionsText);
	}
}

var mainMenu = new MainMenu();
createObject(mainMenu);
mainMenu.visible = true;
export { mainMenu, gaming };