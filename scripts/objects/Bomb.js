var Bomb = function (gameState, position, player) {
    this.gameState = gameState;
    this.player = player;
    this.scene = gameState.scene;

    var bombMaterial = new BABYLON.StandardMaterial("black", this.scene);
    bombMaterial.diffuseColor = BABYLON.Color3.Black();
    this.model = BABYLON.MeshBuilder.CreateSphere("bomb", { segments: 16, diameter: 9 }, this.scene);
    this.model.material = bombMaterial;
    this.model.bomb = this;
    this.model.ellipsoid = new BABYLON.Vector3(4, 0.3, 4);
    this.model.setEnabled(true);
    this.model.position = position;
    this.model.checkCollisions = true;
    this.model.collisionGroup = E_COLLISION_GROUP.BOMB;
    this.model.collisionMask = E_COLLISION_GROUP.ENEMY;

    this.maxDistance = g_defaultBombDistance;

    this.particleSystems = [];
    this.exploded = false;

    //bomb animation
    var bombAnimation = new BABYLON.Animation("bombAnimation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keyFramesBomb = [
        { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
        { frame: 30, value: new BABYLON.Vector3(0.8, 0.8, 0.8) },
        { frame: 60, value: new BABYLON.Vector3(1, 1, 1) }
    ];
    bombAnimation.setKeys(keyFramesBomb);
    this.model.animations.push(bombAnimation);
    this.scene.beginAnimation(this.model, 0, 60, true);

    var self = this;
    setTimeout(function () {
        self.explode();
    }, 2000);
}
Bomb.prototype = {
    explode: function () {
        if (this.exploded) {
            return;
        }
        this.exploded = true;

        var position = this.model.position.clone();

        var directionsToThrowRay = [
            new BABYLON.Vector3(1, 0, 0),
            new BABYLON.Vector3(-1, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, -1)
        ];

        var objectsToDispose = [];

        var self = this;
        directionsToThrowRay.forEach(function (direction) {
            // Throw a ray for the current direction
            var ray = new BABYLON.Ray(position, direction);
            var rayResult = self.scene.pickWithRay(ray, function (mesh) {
                if (mesh.bomb && mesh.bomb.exploded) {
                    return false;
                }
                else {
                    return mesh.isPickable;
                }
            }, false);         

            if (rayResult.hit && rayResult.distance <= self.maxDistance) {
                var pickedMesh = rayResult.pickedMesh;
                if (pickedMesh.softbox) {
                    pickedMesh.softbox.blink();
                    if (objectsToDispose.indexOf(pickedMesh.softbox) == -1) {
                        objectsToDispose.push(pickedMesh.softbox);
                    }
                }
                else if (pickedMesh.player) {
                    self.gameState.endGame = true;
                    self.gameState.displayEndGameGUI("Game Over");
                    //new BABYLON.Layer("gameover", "assets/gui/gameover.png", self.scene, true);
                    //game over here
                }
                else if (pickedMesh.bomb) {
                    if (!pickedMesh.bomb.exploded) {
                        pickedMesh.bomb.explode();
                    }
                }
                else if (pickedMesh.enemy) {
                    pickedMesh.enemy.blink();
                    if (objectsToDispose.indexOf(pickedMesh.enemy) == -1) {
                        objectsToDispose.push(pickedMesh.enemy);
                    }
                }
                self.particleSystems.push(self.explosionParticle(direction, rayResult.distance * rayResult.distance));
            }
            else {
                self.particleSystems.push(self.explosionParticle(direction, self.maxDistance * self.maxDistance));
            }
        });

        setTimeout(function () {
            if (self.player.remainBomb < self.player.maxBomb) {
                self.player.remainBomb += 1;
            };
            self.dispose();
            self.createSmoke();           
            objectsToDispose.forEach(function (object) {
                object.dispose();
            });
        }, 1000);

    },

    dispose: function () {       
        this.particleSystems.forEach(function (p) {
            p.dispose();
        });
        this.model.dispose();
        delete this;
    },

    explosionParticle: function (direction, distanceSquared) {
        var maxPart = 30;
        if (this.maxDistance > g_defaultBombDistance) {
            maxPart = (this.maxDistance - g_defaultBombDistance) / 10 * 30;
        }
        var ps = new BABYLON.ParticleSystem("particles", maxPart, this.scene);
        ps.particleTexture = new BABYLON.Texture("assets/bomb/bombParticle.png", this.scene);

        // custom update
        ps.updateFunction = function (particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                // get distance to the emitter
                var ds = this.emitter.subtract(particle.position).lengthSquared();
                if (ds >= distanceSquared) {
                    particle.age = 999;
                }

                if (particle.age >= particle.lifeTime) {
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
                    particle.color.addInPlace(this._scaledColorStep);

                    if (particle.color.a < 0)
                        particle.color.a = 0;

                    particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;

                    particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
                    particle.position.addInPlace(this._scaledDirection);

                    this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
                    particle.direction.addInPlace(this._scaledGravity);
                }
            }
        };

        // starting point of particle
        ps.emitter = this.model.position.clone();
        ps.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        ps.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

        // Size
        ps.minSize = 5;
        ps.maxSize = 10;

        // Life time
        ps.minLifeTime = ps.maxLifeTime = 80;
        ps.emitRate = 10;
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        ps.gravity = new BABYLON.Vector3(0, 0, 0);

        ps.direction1 = new BABYLON.Vector3(1 * direction.x, 0, 1 * direction.z);
        ps.direction2 = new BABYLON.Vector3(1 * direction.x, 0, 1 * direction.z);

        ps.minAngularSpeed = 0;
        ps.maxAngularSpeed = Math.PI;

        // Speed
        ps.minEmitPower = 1;
        ps.maxEmitPower = 5;
        ps.updateSpeed = 0.45;

        // Start the particle system
        ps.start();
        return ps;
    },
    createSmoke : function () {
        // Create a particle system
        var particleSystem = new BABYLON.ParticleSystem("particles", 20, this.scene);
        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("assets/bomb/smoke.png", this.scene);
        particleSystem.particleTexture.hasAlpha = true;
        // Where the particles come from
        particleSystem.emitter = this.model.position.clone(); // the starting object, the emitter
        particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(1, 1, 1); // To...
        // Colors of all particles
        particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.5);
        particleSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.5);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        // Size of each particle (random between...
        particleSystem.minSize = 2;
        particleSystem.maxSize = 5;
        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.3;
        // Emission rate
        particleSystem.emitRate = 100000;
        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(-1, 10, 1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 10, -1);
        //particleSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0);
        // Angular speed, in radians
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI / 8;
        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 7;
        particleSystem.updateSpeed = 0.001;

        particleSystem.targetStopDuration = 0.1;
        particleSystem.disposeOnStop = true;

        particleSystem.start();
    }
}