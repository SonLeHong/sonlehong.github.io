var Player = function (assetName, gameState, position) {
    this.gameState = gameState;
    this.scene = gameState.scene;
    this.position = position;

    this.speed = 0.75;
    this.maxBomb = 3;
    this.remainBomb = this.maxBomb;

    this.model = gameState.createMesh(gameState.assets[assetName], "player", 0);
    this.model.position = position;

    this.model.isVisible = true;
    //hard code here, again
    this.model.ellipsoid = new BABYLON.Vector3(4, 0.3, 4);
    this.model.checkCollisions = true;
    this.model.collisionGroup = E_COLLISION_GROUP.PLAYER;
    this.model.collisionMask = E_COLLISION_GROUP.ENEMY;
    this.model.setEnabled(true);
    this.model.player = this;
    

    this.collisionBox = BABYLON.MeshBuilder.CreateBox("collisionBoxPlayer", { size: 8 }, this.scene);
    this.collisionBox.isVisible = false;
    this.collisionBox.parent = this.model;
    this.collisionBox.player = this;

    this.moveDirection = [0, 0, 0, 0];

    this.registerAction();

    var self = this;
    this.scene.registerBeforeRender(function () {
        self.update();
    });

    this.interval = setInterval(function () {
        if (self.remainBomb < self.maxBomb) {
            self.remainBomb += 1;
        }
    }, 3000); //refill bomb for every 3s
    this.model.onCollide = function (colMesh) {
        if (colMesh.name === "enemy") {
            self.gameState.displayEndGameGUI("Game Over");
            self.gameState.endGame = true;
        }
    }
}

Player.prototype = {
    registerAction: function () {
        if (this.scene.actionManager == null) {
            this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        }
        var self = this;
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
            switch (event.sourceEvent.keyCode) {
                case 87: //"W"
                    self.prepareActionWalk();
                    self.model.rotation.y = Math.PI;
                    self.moveDirection[E_MOVE_DIRECTION.UP] = 1;
                    break;
                case 83: //"S"
                    self.prepareActionWalk();
                    self.model.rotation.y = 0;
                    self.moveDirection[E_MOVE_DIRECTION.DOWN] = 1;
                    break;
                case 65: //"A"
                    self.prepareActionWalk();
                    self.model.rotation.y = Math.PI / 2;
                    self.moveDirection[E_MOVE_DIRECTION.LEFT] = 1;
                    break;
                case 68: //"D"
                    self.prepareActionWalk();
                    self.model.rotation.y = -Math.PI / 2;
                    self.moveDirection[E_MOVE_DIRECTION.RIGHT] = 1;
                    break;
                case 32: //"Space"
                    break;
                default:
                    break;
            }
        }));

        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (event) {
            switch (event.sourceEvent.keyCode) {
                case 87: //"W"
                    self.moveDirection[E_MOVE_DIRECTION.UP] = 0;
                    break;
                case 83: //"S"
                    self.moveDirection[E_MOVE_DIRECTION.DOWN] = 0;
                    break;
                case 65: //"A"
                    self.moveDirection[E_MOVE_DIRECTION.LEFT] = 0;
                    break;
                case 68: //"D"
                    self.moveDirection[E_MOVE_DIRECTION.RIGHT] = 0;
                    break;
                case 32: //"Space"
                    self.putBomb();
                    break;
                default: //"Space"
                    break;
            }
            var temp = 0;
            for (var i = 0; i < 4; i++) {
                temp += self.moveDirection[i];
            }
            if (temp == 0 && self.animatable) {
                self.prepareActionIdle();
            }
        }));
    },
    update: function () {
        if (this.gameState.endGame) {
            return;
        }
        if (this.moveDirection[E_MOVE_DIRECTION.UP] != 0) {
            this.model.moveWithCollisions(new BABYLON.Vector3(0, 0, this.speed));
        }
        if (this.moveDirection[E_MOVE_DIRECTION.DOWN] != 0) {
            this.model.moveWithCollisions(new BABYLON.Vector3(0, 0, -this.speed));
        }
        if (this.moveDirection[E_MOVE_DIRECTION.LEFT] != 0) {
            this.model.moveWithCollisions(new BABYLON.Vector3(-this.speed, 0, 0));
        }
        if (this.moveDirection[E_MOVE_DIRECTION.RIGHT] != 0) {
            this.model.moveWithCollisions(new BABYLON.Vector3(this.speed, 0, 0));
        }
    },

    prepareActionWalk: function () {
        if (!this.animatable) {
            var walk = this.model.animations['walk'];
            for (var i = 0; i < this.model.skeletons.length; i++) {
                this.animatable = this.scene.beginAnimation(this.model.skeletons[i], walk.start, walk.end, true, walk.speed * this.speed);
            }
        }
    },

    prepareActionIdle: function () {
        var idle = this.model.animations['idle'];
        for (var i = 0; i < this.model.skeletons.length; i++) {
            this.scene.beginAnimation(this.model.skeletons[i], idle.start, idle.end, true, idle.speed);
        }
        this.animatable = null;
    },

    putBomb: function () {
        if (this.remainBomb > 0) {
            var bomb = new Bomb(this.gameState, this.model.position.clone(), this);
            //this.state.bombs.push(bomb);
            this.remainBomb--;
        }
    }
}