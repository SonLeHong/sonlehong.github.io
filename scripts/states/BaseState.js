var BaseState = function (gameMain) {
    this.gameMain = gameMain;
    this.engine = gameMain.engine;
    this.assets = [];
    this.scene = null;
    this.isReady = false;
};

BaseState.prototype = {

    run: function () { },

    initScene: function () {
        return null;
    },

    initGame: function () { }

};