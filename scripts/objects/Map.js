E_BOX_TYPE = {
    NONE: 0,
    SOFT: 1,
    HARD: 2
};


var Map = function (gameState) {
    this.gameState = gameState;
    this.boxSize = 10;
    this.noOfBoxWidth = 21;
    this.noOfBoxHeight = 13;
    this.maxEnemy = 20;
    this.gameState.noOfEnemy = this.maxEnemy;
    this.maxSoftBox = 50;
    this.width = this.noOfBoxWidth * this.boxSize;
    this.height = this.noOfBoxHeight * this.boxSize;

    ////ground
    //var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
    ////groundMaterial.diffuseColor = BABYLON.Color3.Green();
    //groundMaterial.diffuseTexture = new BABYLON.Texture("assets/ground/grass.jpg", this.scene);
    //var ground = BABYLON.MeshBuilder.CreateGround('ground1', { width: this.width + 300, height: this.height + 300, subdivisions: 1 }, this.scene);
    //ground.position = new BABYLON.Vector3(this.width / 2, 0, this.height / 2);
    //ground.material = groundMaterial;
    ////end ground

    var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, this.scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture("assets/ground/grass.jpg", this.scene);
    groundMaterial.diffuseTexture.uScale = 60;
    groundMaterial.diffuseTexture.vScale = 60;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.position = new BABYLON.Vector3(this.width / 2, -5, this.height / 2);
    ground.material = groundMaterial;

    //border
    var topSide = BABYLON.MeshBuilder.CreateBox("topSideMap", { width: this.width, height: this.boxSize, size: 1 }, this.gameState.scene);
    topSide.position = new BABYLON.Vector3(this.width / 2, 0, this.height + 0.5);
    topSide.checkCollisions = true;

    var botSide = topSide.clone("botSizeMap");
    botSide.position.z = - 0.5;
    botSide.checkCollisions = true;

    var leftSide = BABYLON.MeshBuilder.CreateBox("leftSideMap", { width: 1, height: this.boxSize, size: this.height }, this.gameState.scene);
    leftSide.position = new BABYLON.Vector3(-0.5, 0, this.height / 2 + 0.5);
    leftSide.checkCollisions = true;

    var rightSide = leftSide.clone("rightSideMap");
    rightSide.position.x = this.width + 0.5;
    rightSide.checkCollisions = true;
    //end border

    var i, j;

    var mapArray = new Array(this.noOfBoxHeight);
    for (i = 0; i < this.noOfBoxHeight; i++) {
        mapArray[i] = new Array(this.noOfBoxWidth);
    }
    
    for (i = 0; i < this.noOfBoxHeight; i++) {
        for (j = 0; j < this.noOfBoxWidth; j++) {
            if ((i == 0 || i == 1 || i == this.noOfBoxHeight - 2 || i == this.noOfBoxHeight - 1)
                && (j == 0 || j == 1 || j == this.noOfBoxWidth - 2 || j == this.noOfBoxWidth - 1)               
            )
            {
                mapArray[i][j] = 0;
                continue;
            }
            
            var pos = new BABYLON.Vector3((j + 0.5) * this.boxSize, 0, (i + 0.5) * this.boxSize);
            var boxName = "box_" + i + "_" + j;
            if (i % 2 == 0 && j % 2 == 0) {
                var b = new Box(boxName, this.gameState, E_BOX_TYPE.HARD, pos);
                mapArray[i][j] = E_BOX_TYPE.HARD;
            }
            //else if (Math.floor(Math.random() * 10) % 2 == 0) {
            //    var b = new Box(boxName, this.gameState, E_BOX_TYPE.SOFT, pos);
            //    mapArray[i][j] = E_BOX_TYPE.SOFT;
            //}
        }
    }
    //random softbox
    var noOfSoftBox = 0;
    while (noOfSoftBox < this.maxSoftBox) {
        i = Math.floor(Math.random() * this.noOfBoxHeight);
        j = Math.floor(Math.random() * this.noOfBoxWidth);
        if (mapArray[i][j] == undefined) {
            var b = new Box(boxName, this.gameState, E_BOX_TYPE.SOFT, new BABYLON.Vector3((j + 0.5) * this.boxSize, 0, (i + 0.5) * this.boxSize));
            mapArray[i][j] = E_BOX_TYPE.SOFT;
            noOfSoftBox += 1;
        }
    }

    //random enemy
    var noOfEnemy = 0;
    while (noOfEnemy < this.maxEnemy) {
        i = Math.floor(Math.random() * this.noOfBoxHeight);
        j = Math.floor(Math.random() * this.noOfBoxWidth);
        if (mapArray[i][j] == undefined) {
            var enemy = new Enemy(this.gameState, new BABYLON.Vector3((j + 0.5) * this.boxSize, 0, (i + 0.5) * this.boxSize));
            mapArray[i][j] = 5;
            noOfEnemy += 1;
        }
    }
}