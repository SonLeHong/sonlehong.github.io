var GameState = function (gameMain) {
    BaseState.call(this, gameMain);

    this.assets = [];
    this.endGame = false;
    this.noOfEnemy = 0;
    var self = this;
    window.addEventListener("resize", function () {
        self.engine.resize();
    });
};

GameState.prototype = Object.create(BaseState.prototype);
GameState.prototype.constructor = GameState;

GameState.prototype = {
    initMesh: function (task, animations) {
        for (var i = 0; i < task.loadedMeshes.length; i++) {
            var mesh = task.loadedMeshes[i];
            mesh.isPickable = false;
            mesh.setEnabled(false);
            this.scene.stopAnimation(mesh);
        }
        this.assets[task.name] = { meshes: task.loadedMeshes, animations: animations };
    },
    createMesh: function (obj, name, id) {
        var parent = new BABYLON.Mesh(name + "-" + id, this.scene);
        parent.skeletons = [];

        var meshes = obj.meshes;
        for (var i = 0; i < meshes.length; i++) {
            var newmesh = meshes[i].createInstance(meshes[i].name + "-" + id);
            newmesh.isPickable = false;
            // Clone animations if any
            if (meshes[i].skeleton) {
                newmesh.skeleton = meshes[i].skeleton.clone();
                parent.skeletons.push(newmesh.skeleton);
            }
            newmesh.parent = parent;
        }
        parent.isPickable = false;
        parent.animations = obj.animations;
        return parent;
    },

    initGame: function () {
        //var box = new Box(this, true, new BABYLON.Vector3(0, 0, 0));
        //var box2 = new Box(this, true, new BABYLON.Vector3(20, 0, 0));
        var map = new Map(this);
        var pos = null;
        //hard code here. hic
        var player = new Player('player', this, new BABYLON.Vector3(5, 0, 5));
        this.player = player;
    },

    run: function () {
        //init scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.collisionsEnabled = true;
        var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(100, 150, -50), this.scene);
        camera.setTarget(new BABYLON.Vector3(100, 0, 50));
        //var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 150, -50), this.scene);
        //camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        //camera.attachControl(this.engine.getRenderingCanvas());

        // Hemispheric light to light the scene
        var h = new BABYLON.HemisphericLight("HemisphericLight", new BABYLON.Vector3(0, 100, 0), this.scene);
        h.intensity = 0.8;

        //skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        //end skybox

        //end init scene

        //load resource
        var self = this;
        var loader = new BABYLON.AssetsManager(this.scene);

        var loadPlayerTask = loader.addMeshTask("player", "", "./assets/player/", "player.babylon");
        loadPlayerTask.onSuccess = function (t) {
            var anims = [];
            anims['walk'] = { start: 0, end: 30, speed: 2 };
            anims['idle'] = { start: 0, end: 1, speed: 4 };
            self.initMesh(t, anims);
        };

        loader.onFinish = function (tasks) {

            // Init the game
            self.initGame();

            self.engine.runRenderLoop(function () {
                self.scene.render();
            });
        };

        loader.load();
    },
    displayEndGameGUI: function (message) {
        // GUI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");

        var label = new BABYLON.GUI.Rectangle("label1");
        label.background = "black";
        label.height = "100%";
        label.alpha = 0.5;
        label.width = "100%";
        label.cornerRadius = 20;
        label.thickness = 1;
        label.linkOffsetY = 30;
        label.zIndex = 5;
        label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(label);

        var text1 = new BABYLON.GUI.TextBlock();
        text1.text = message;
        text1.color = "white";
        text1.fontSize = 50;
        label.addControl(text1);
    }
};
