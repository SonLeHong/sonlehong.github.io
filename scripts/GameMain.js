E_STATE = {
    WAITING_PLAYER_STATE: 0,
    GAME_STATE: 1,
}
var GameMain = function (canvasName) {

    var canvas = document.getElementById(canvasName);

    this.engine = new BABYLON.Engine(canvas, true);

    this.currentStateId = -1;
    this.currentState = null;

    this.runState(E_STATE.GAME_STATE);
};

GameMain.prototype = {
    runState: function (stateId) {
        this.currentStateId = stateId;
        switch (stateId) {
            case E_STATE.GAME_STATE:
                this.currentState = new GameState(this);
                break;
            default:
                break;
        }
        this.currentState.run();
    }   
};
