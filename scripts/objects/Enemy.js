var Enemy = function (gameState, position) {
    this.gameState = gameState;
    this.scene = gameState.scene;
    this.position = position;

    var enemyMaterial = new BABYLON.StandardMaterial("red", this.scene);
    enemyMaterial.diffuseColor = BABYLON.Color3.Red();

    this.model = BABYLON.MeshBuilder.CreateSphere("enemy", { segments: 16, diameter: 9.5 }, this.scene);
    this.model.material = enemyMaterial;
    this.model.position = position;
    this.model.enemy = this;
    this.model.ellipsoid = new BABYLON.Vector3(4.75, 0.1, 4.75);
    this.model.checkCollisions = true;
    this.model.collisionGroup = E_COLLISION_GROUP.ENEMY;
    //this.model.collisionMask = E_COLLISION_GROUP.PLAYER + E_COLLISION_GROUP.BOMB;

    this.moveDirection = new BABYLON.Vector3(0, 0, 0);
    this.speed = 0.4;
    this.blinkTime = 25;

    var self = this;

    this.scene.registerBeforeRender(function () {
        if (!self.gameState.endGame) {
            self.update();
        }
    });
    
    this.interval = setInterval(function () {
        self.changeMovingDirection();
    }, 1000); //change moving direction each 1s
}

Enemy.prototype = {
    changeMovingDirection: function () {
        this.moveDirection.x = 0;
        this.moveDirection.y = 0;
        this.moveDirection.z = 0;

        var r = Math.floor(Math.random() * 4); //random direction
        switch (r) {
            case E_MOVE_DIRECTION.UP:
                this.moveDirection.z = 1;
                break;
            case E_MOVE_DIRECTION.DOWN:
                this.moveDirection.z = -1;
                break;
            case E_MOVE_DIRECTION.LEFT:
                this.moveDirection.x = -1;
                break;
            case E_MOVE_DIRECTION.RIGHT:
                this.moveDirection.x = 1;
                break;
            default:
                break;
        }
    },
    update: function () {
        this.model.moveWithCollisions(this.moveDirection.multiplyByFloats(this.speed, this.speed, this.speed));
        //if (posBeforeMove == posAfterMove) { //cant move?
        //    this.changeMovingDirection();
        //    clearInterval(this.interval);
        //    this.interval = setInterval(function () {
        //        self.changeMovingDirection();
        //    }, 5000); //change moving direction each 5s
        //}
    },

    blink: function () {
        var _this = this;
        this.interval = setInterval(function () {

            if (_this.model.isVisible) {
                _this.model.isVisible = false;
            } else {
                _this.model.isVisible = true;
            }
        }, this.blinkTime);
    },

    dispose: function () {
        clearInterval(this.interval);
        this.model.dispose();
        this.gameState.noOfEnemy--;
        if (this.gameState.noOfEnemy == 0) {
            this.gameState.displayEndGameGUI("Win");
            this.gameState.endGame = true;
        }
        delete this;        
    }
}