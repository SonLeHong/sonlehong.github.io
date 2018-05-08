var Box = function (name, gameState, type, position) {
    this.gameState = gameState;
    this.scene = gameState.scene;
    this.position = position;
    this.size = g_boxSize;
    this.blinkTime = 25;

    this.model = null;

    if (type == E_BOX_TYPE.HARD) {
        this.model = BABYLON.MeshBuilder.CreateBox(name, { size: this.size }, this.scene);
        var boxMat = new BABYLON.StandardMaterial("boxMat", this.scene);
        boxMat.diffuseTexture = new BABYLON.Texture("assets/hardbox/hardbox.jpg", this.scene);
        boxMat.specularColor = BABYLON.Color3.Black();
        
        this.model.material = boxMat;
        this.model.checkCollisions = true;
    }
    else {
        this.model = BABYLON.MeshBuilder.CreateBox(name, { size: this.size }, this.scene);
        var boxMat = new BABYLON.StandardMaterial("boxMat", this.scene);
        boxMat.diffuseTexture = new BABYLON.Texture("assets/soft_box/wood.jpg", this.scene);
        boxMat.specularColor = BABYLON.Color3.Black();

        this.model.material = boxMat;
        this.model.checkCollisions = true;

        this.model.softbox = this;
    }
    //this.model.ellipsoid = new BABYLON.Vector3(5, 0.1, 5);
    this.model.position = position;
}

Box.prototype = {
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
        delete this;
    }
}