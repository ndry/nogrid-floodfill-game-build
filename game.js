var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class GameEngine extends Phaser.Game {
            constructor() {
                super(888 * 2 + 100, 804, Phaser.AUTO, 'content', null);
                this.state.add('Boot', Client.Boot, false);
                this.state.add('Preloader', Client.Preloader, false);
                this.state.add('MainMenu', Client.MainMenu, false);
                this.state.add('Level01', Client.Level01, false);
                this.state.add('HostGame', Client.HostGame, false);
                this.state.add('JoinGame', Client.JoinGame, false);
                this.state.start('Level01');
            }
        }
        Client.GameEngine = GameEngine;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
window.onload = () => {
    new $safeprojectname$.Client.GameEngine();
};
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Player {
            constructor(game, color) {
                this.game = game;
                this.color = color;
                this.baseTrees = [];
            }
            walkTrees(fn) {
                const visited = new Set();
                const queue = this.baseTrees.map(tree => ({ tree, step: 0 }));
                while (queue.length > 0) {
                    const entry = queue.shift();
                    if (visited.has(entry.tree)) {
                        continue;
                    }
                    visited.add(entry.tree);
                    fn(entry.tree, entry.step)
                        .forEach(t => queue.push({ tree: t, step: entry.step + 1 }));
                }
            }
            turn(color) {
                this.walkTrees((tree, step) => {
                    tree.colorWaves.push({
                        start: this.game.time.time,
                        step: step,
                        color: color.color,
                        justOwned: tree.owner !== this
                    });
                    if (tree.owner !== this) {
                        tree.owner = this;
                        tree.highlightColor = this.color;
                    }
                    tree.data.color = color;
                    return tree.neighbours
                        .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this));
                });
            }
            score(color) {
                let score = 0;
                this.walkTrees(tree => {
                    score += tree.score;
                    return tree.neighbours
                        .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this));
                });
                return score;
            }
        }
        Client.Player = Player;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class TreeColor {
            constructor(color) {
                this.color = color;
            }
        }
        Client.TreeColor = TreeColor;
        class TreeData {
        }
        Client.TreeData = TreeData;
        class Tree {
            constructor(game, data) {
                this.game = game;
                this.data = data;
                this.owner = null;
                this.neighbours = [];
                this.colorWaves = [];
                this.highlightColor = null;
            }
            setTreeSpriteForColor(color) {
                if (color === this.lastTreeLight) {
                    return;
                }
                if (this.treeSprite) {
                    this.treeSprite.destroy(true);
                }
                this.treeSprite = this.game.add.sprite(this.data.x, this.data.y, this.game.cache.getBitmapData(`tree-${color}-${this.data.size}`));
                this.treeSprite.anchor.setTo(0.5);
                this.treeSprite.z = 200;
                this.lastTreeLight = color;
            }
            setTreeHighlightTemp(color) {
                if (!this.treeHighlightTempSpriteCache) {
                    this.treeHighlightTempSpriteCache = {};
                }
                if (color) {
                    if (!this.treeHighlightTempSpriteCache[color]) {
                        this.treeHighlightTempSpriteCache[color] = this.game.add.sprite(this.data.x, this.data.y, this.game.cache.getBitmapData(`tree-highlight-${color}-${this.data.size}`));
                        this.treeHighlightTempSpriteCache[color].anchor.setTo(0.5);
                        this.treeHighlightTempSpriteCache[color].z = 1000;
                    }
                }
                for (let key in this.treeHighlightTempSpriteCache) {
                    if (this.treeHighlightTempSpriteCache.hasOwnProperty(key)) {
                        const value = this.treeHighlightTempSpriteCache[key];
                        value.visible = (key === color);
                    }
                }
            }
            setTreeLightTemp(color, alpha) {
                if (!this.treeLightTempSpriteCache) {
                    this.treeLightTempSpriteCache = {};
                }
                if (color) {
                    if (!this.treeLightTempSpriteCache[color]) {
                        this.treeLightTempSpriteCache[color] = this.game.add.sprite(this.data.x, this.data.y, this.game.cache.getBitmapData(`tree-${color}-${this.data.size}`));
                        this.treeLightTempSpriteCache[color].anchor.setTo(0.5);
                        this.treeLightTempSpriteCache[color].z = 300;
                    }
                }
                for (let key in this.treeLightTempSpriteCache) {
                    if (this.treeLightTempSpriteCache.hasOwnProperty(key)) {
                        const value = this.treeLightTempSpriteCache[key];
                        value.alpha = (key === color) ? alpha : 0;
                    }
                }
            }
            fin() {
                this.setTreeSpriteForColor(this.owner ? this.owner.color : this.data.color.color);
            }
            update() {
                this.setTreeHighlightTemp(this.highlightColor);
                const stepDurationMs = 25;
                while (this.colorWaves[0]
                    && (Math.floor(this.game.time.elapsedSince(this.colorWaves[0].start) / stepDurationMs) - this.colorWaves[0].step > 50)) {
                    this.colorWaves.shift();
                }
                for (let i = this.colorWaves.length - 1; i >= 0; i--) {
                    const wave = this.colorWaves[i];
                    const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
                    if (timeStep >= 0) {
                        if (wave.justOwned) {
                            this.setTreeSpriteForColor(this.owner.color);
                        }
                    }
                }
                for (let i = this.colorWaves.length - 1; i >= 0; i--) {
                    const wave = this.colorWaves[i];
                    const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
                    if (timeStep >= 0) {
                        this.setTreeLightTemp(wave.color, (25 - timeStep) / 25);
                        break;
                    }
                }
            }
            get score() { return this.data.size * this.data.size * Math.PI; }
        }
        Client.Tree = Tree;
        class Tree_obs extends Phaser.Sprite {
            constructor(game, x, y, color, size) {
                let bitmapData = game.add.bitmapData(100, 100);
                super(game, x, y, bitmapData);
                this.bitmapData = bitmapData;
                this.color = color;
                this.size = size;
                this.owner = null;
                this.neighbours = [];
                this.highlighted = false;
                this.score = this.size * this.size * Math.PI;
                this.anchor.setTo(0.5);
                game.add.existing(this);
                this.switchOrder = -1;
                this.blinkOrder = -1;
                this.switchStart = null;
            }
            update() {
                let color = this.owner ? this.owner.color : this.color.color;
                if (this.switchStart !== null) {
                    const timeStep = Math.floor(this.game.time.elapsedSince(this.switchStart) / 50);
                    if (timeStep >= this.blinkOrder && timeStep < this.blinkOrder + 5) {
                        color = this.color.color;
                    }
                    else if (timeStep < this.switchOrder) {
                        color = this.color.color;
                    }
                }
                if (color === this.lastColor) {
                    return;
                }
                this.lastColor = color;
                const centerX = this.bitmapData.width / 2;
                const centerY = this.bitmapData.height / 2;
                this.bitmapData.cls();
                this.bitmapData.context.beginPath();
                this.bitmapData.context.fillStyle = "rgba(0, 0, 0, .3)";
                this.bitmapData.context.arc(centerX + this.size / 2, centerY + this.size / 2, this.size, 0, Math.PI * 2);
                this.bitmapData.context.fill();
                var gradient = this.bitmapData.context.createRadialGradient(centerX - this.size / 2, centerY - this.size / 2, 0, centerX - this.size / 2, centerY - this.size / 2, this.size * 4);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'black');
                this.bitmapData.context.beginPath();
                this.bitmapData.context.fillStyle = gradient;
                this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
                this.bitmapData.context.fill();
                if (this.owner) {
                    this.bitmapData.context.beginPath();
                    this.bitmapData.context.strokeStyle = this.owner.color;
                    this.bitmapData.context.lineWidth = 3;
                    this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
                    this.bitmapData.context.stroke();
                }
                this.bitmapData.context.beginPath();
                this.bitmapData.context.strokeStyle = "#000000";
                this.bitmapData.context.lineWidth = 1;
                this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
                this.bitmapData.context.stroke();
                for (let i = 0; i < this.neighbours.length; i++) {
                    const t = this.neighbours[i];
                    this.bitmapData.context.beginPath();
                    this.bitmapData.context.moveTo(centerX, centerY);
                    this.bitmapData.context.lineTo(centerX + t.x - this.x, centerY + t.y - this.y);
                    this.bitmapData.context.strokeStyle = "rgba(0, 0, 0, .2)";
                    this.bitmapData.context.stroke();
                }
                this.bitmapData.dirty = true;
            }
        }
        Client.Tree_obs = Tree_obs;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Boot extends Phaser.State {
            preload() {
            }
            create() {
                this.stage.setBackgroundColor(0x000000);
                this.input.maxPointers = 1;
                this.stage.disableVisibilityChange = true;
                this.game.state.start('Preloader', true, false);
            }
        }
        Client.Boot = Boot;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class HostGame extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            static generateTrees(game, map, mapMaskBmd, treeColors, players) {
                const trees = [];
                const chunkSide = 100;
                const chunks = [];
                for (let cx = 0; cx < map.width / chunkSide; cx++) {
                    chunks[cx] = [];
                    for (let cy = 0; cy < map.height / chunkSide; cy++) {
                        chunks[cx][cy] = [];
                    }
                }
                let failedCount = 0;
                while (failedCount < 500) {
                    const x = Math.floor(map.x + map.width * Math.random());
                    const y = Math.floor(map.y + map.height * Math.random());
                    const size = 8 + 20 * Math.random() * Math.random() * Math.random();
                    const color = Client.getRandomElement(treeColors);
                    const cx = Math.floor((x - map.x) / chunkSide);
                    const cy = Math.floor((y - map.y) / chunkSide);
                    let allowed = true;
                    for (let dcx = -1; dcx <= 1; dcx++) {
                        for (let dcy = -1; dcy <= 1; dcy++) {
                            const chunk = (chunks[cx + dcx] || [])[cy + dcy] || [];
                            allowed = !chunk.find(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size));
                            if (!allowed) {
                                break;
                            }
                        }
                        if (!allowed) {
                            break;
                        }
                    }
                    allowed = allowed && mapMaskBmd.getPixel32(x, y) === 4278190080;
                    if (allowed) {
                        failedCount = 0;
                        const tree = new $safeprojectname$.Client.Tree_obs(game, x, y, color, size);
                        const chunk = chunks[cx][cy] = (chunks[cx] || [])[cy] || [];
                        chunk.push(tree);
                        trees.push(tree);
                    }
                    else {
                        failedCount++;
                    }
                }
                players.forEach(player => {
                    const tree = Client.getRandomElement(trees);
                    player.baseTrees.push(tree);
                    tree.owner = player;
                });
                return trees;
            }
            static processTrees(trees) {
                trees.forEach(tree => {
                    const closeTrees = trees
                        .filter(t => tree !== t && t.position.distance(tree.position) - (t.size + tree.size) < 24)
                        .sort((at, bt) => tree.position.distance(at.position) - tree.position.distance(bt.position));
                    let hiddenTrees = [];
                    for (let i = 0; i < closeTrees.length; i++) {
                        const t = closeTrees[i];
                        const dt = t.position.clone().subtract(tree.position.x, tree.position.y);
                        const at = Math.asin(t.size / dt.getMagnitude());
                        hiddenTrees = hiddenTrees.concat(closeTrees
                            .slice(i + 1)
                            .filter(t2 => {
                            const dt2 = t2.position.clone().subtract(tree.position.x, tree.position.y);
                            const at2 = Math.asin(t2.size / dt2.getMagnitude());
                            const minAllowedAngle = at + at2;
                            var a = Math.acos(dt.dot(dt2) / (dt.getMagnitude() * dt2.getMagnitude()));
                            return a < minAllowedAngle;
                        }));
                    }
                    closeTrees
                        .filter(t => hiddenTrees.indexOf(t) < 0)
                        .forEach(t => {
                        tree.neighbours.push(t);
                        t.neighbours.push(tree);
                    });
                });
            }
            create() {
                this.gameId = uuidv4();
                const gidEl = document.getElementById("game-id");
                gidEl.value = this.gameId;
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = this.add.sprite(0, 0, 'map1');
                this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.mapMaskBmd.draw('map1-mask', 0, 0);
                this.mapMaskBmd.update();
                this.players = [new $safeprojectname$.Client.Player_obs(this.game, "red"), new $safeprojectname$.Client.Player_obs(this.game, "blue")];
                this.currentPlayerIndex = 0;
                this.thisPlayerIndex = 1;
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.trees = HostGame.generateTrees(this.game, this.map, this.mapMaskBmd, this.treeColors, this.players);
                this.couch = nano({
                    url: 'https://couchdb-6aa960.smileupps.com',
                    cors: true
                });
                const db = this.couch.use("nogrid-floodfill-game");
                db.insert({
                    _id: this.gameId,
                    type: "game",
                    trees: this.trees.map(tree => ({
                        x: tree.x,
                        y: tree.y,
                        size: tree.size,
                        color: tree.color.color,
                        owner: tree.owner ? tree.owner.color : null
                    }))
                });
                HostGame.processTrees(this.trees);
                this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                this.players.forEach(player => {
                    player.turn(player.baseTrees[0].color);
                });
                this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 90, 10 + i * 25, (this.currentPlayerIndex === i ? "> " : "") +
                    (player.score(null) / this.fullScore * 100).toFixed(2) +
                    "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
                    btn.inputEnabled = true;
                    btn.events.onInputUp.add(() => { this.playerTurn(color); }, this);
                    return btn;
                });
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));
                setTimeout(this.poll.bind(this));
                this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
            }
            poll() {
                const db = this.couch.use("nogrid-floodfill-game");
                db.changes({
                    feed: "longpoll",
                    include_docs: true,
                    filter: "main/turns",
                    gameId: this.gameId,
                    since: this.lastSeq || 0
                }, (err, body) => {
                    setTimeout(this.poll.bind(this));
                    if (err) {
                        console.log(err);
                        return;
                    }
                    body.results.forEach(result => {
                        this.applyTurn(result.doc.color);
                    });
                    this.lastSeq = body.last_seq;
                    this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
                });
            }
            applyTurn(colorData) {
                const color = this.treeColors.find(c => c.color === colorData);
                this.players[this.currentPlayerIndex].turn(color);
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                this.players.forEach((player, i) => {
                    this.playerScores[i].text =
                        (this.currentPlayerIndex === i ? "> " : "") +
                            (player.score(null) / this.fullScore * 100).toFixed(2) +
                            "%";
                });
            }
            playerTurn(color) {
                if (this.currentPlayerIndex !== this.thisPlayerIndex) {
                    return;
                }
                this.treeColorButtons.forEach(btn => btn.visible = false);
                const db = this.couch.use("nogrid-floodfill-game");
                db.insert({
                    type: "turn",
                    gameId: this.gameId,
                    color: color.color
                });
            }
        }
        Client.HostGame = HostGame;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class JoinGame extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            create() {
                const gidEl = document.getElementById("game-id");
                this.gameId = gidEl.value;
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = this.add.sprite(0, 0, 'map1');
                this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.mapMaskBmd.draw('map1-mask', 0, 0);
                this.mapMaskBmd.update();
                this.players = [new $safeprojectname$.Client.Player_obs(this.game, "red"), new $safeprojectname$.Client.Player_obs(this.game, "blue")];
                this.currentPlayerIndex = 0;
                this.thisPlayerIndex = 0;
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.couch = nano({
                    url: 'https://couchdb-6aa960.smileupps.com',
                    cors: true
                });
                const db = this.couch.use("nogrid-floodfill-game");
                db.get(this.gameId, (err, body) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.trees = body.trees.map(treeData => {
                        const color = this.treeColors.find(c => c.color === treeData.color);
                        const tree = new $safeprojectname$.Client.Tree_obs(this.game, treeData.x, treeData.y, color, treeData.size);
                        if (treeData.owner) {
                            const player = this.players.find(p => p.color === treeData.owner);
                            tree.owner = player;
                            player.baseTrees.push(tree);
                        }
                        return tree;
                    });
                    Client.HostGame.processTrees(this.trees);
                    this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                    this.players.forEach(player => {
                        player.turn(player.baseTrees[0].color);
                    });
                    this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 80, 10 + i * 25, (this.currentPlayerIndex === i ? "> " : "") +
                        (player.score(null) / this.fullScore * 100).toPrecision(2) +
                        "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                });
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
                    btn.inputEnabled = true;
                    btn.events.onInputUp.add(() => { this.playerTurn(color); }, this);
                    return btn;
                });
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));
                setTimeout(this.poll.bind(this));
                this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
            }
            poll() {
                const db = this.couch.use("nogrid-floodfill-game");
                db.changes({
                    feed: "longpoll",
                    include_docs: true,
                    filter: "main/turns",
                    gameId: this.gameId,
                    since: this.lastSeq || 0
                }, (err, body) => {
                    setTimeout(this.poll.bind(this));
                    if (err) {
                        console.log(err);
                        return;
                    }
                    body.results.forEach(result => {
                        this.applyTurn(result.doc.color);
                    });
                    this.lastSeq = body.last_seq;
                    this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
                });
            }
            applyTurn(colorData) {
                const color = this.treeColors.find(c => c.color === colorData);
                this.players[this.currentPlayerIndex].turn(color);
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                this.players.forEach((player, i) => {
                    this.playerScores[i].text =
                        (this.currentPlayerIndex === i ? "> " : "") +
                            (player.score(null) / this.fullScore * 100).toFixed(2) +
                            "%";
                });
            }
            playerTurn(color) {
                if (this.currentPlayerIndex !== this.thisPlayerIndex) {
                    return;
                }
                this.treeColorButtons.forEach(btn => btn.visible = false);
                const db = this.couch.use("nogrid-floodfill-game");
                db.insert({
                    type: "turn",
                    gameId: this.gameId,
                    color: color.color
                });
            }
        }
        Client.JoinGame = JoinGame;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Level01 extends Phaser.State {
            loadTreeBitmapData(size, color) {
                const radius = size;
                const treeBitmapData = this.game.add.bitmapData(radius * 3, radius * 3);
                const centerX = treeBitmapData.width / 2;
                const centerY = treeBitmapData.height / 2;
                treeBitmapData.context.beginPath();
                treeBitmapData.context.fillStyle = "rgba(0, 0, 0, .3)";
                treeBitmapData.context.arc(centerX + radius / 2, centerY + radius / 2, radius, 0, Math.PI * 2);
                treeBitmapData.context.fill();
                var gradient = treeBitmapData.context.createRadialGradient(centerX - radius / 2, centerY - radius / 2, 0, centerX - radius / 2, centerY - radius / 2, radius * 4);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'black');
                treeBitmapData.context.beginPath();
                treeBitmapData.context.fillStyle = gradient;
                treeBitmapData.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                treeBitmapData.context.fill();
                treeBitmapData.context.beginPath();
                treeBitmapData.context.strokeStyle = "#000000";
                treeBitmapData.context.lineWidth = 1;
                treeBitmapData.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                treeBitmapData.context.stroke();
                this.game.cache.addBitmapData(`tree-${color}-${size}`, treeBitmapData);
            }
            loadTreeHighlightBitmapData(size, color) {
                const radius = size;
                const treeBitmapData = this.game.add.bitmapData(radius * 3, radius * 3);
                const centerX = treeBitmapData.width / 2;
                const centerY = treeBitmapData.height / 2;
                treeBitmapData.context.beginPath();
                treeBitmapData.context.strokeStyle = color;
                treeBitmapData.context.lineWidth = 2;
                treeBitmapData.context.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
                treeBitmapData.context.stroke();
                this.game.cache.addBitmapData(`tree-highlight-${color}-${size}`, treeBitmapData);
            }
            preload() {
                super.preload();
                for (let size = 8; size < 5 + 30; size++) {
                    this.loadTreeBitmapData(size, "green");
                    this.loadTreeBitmapData(size, "yellow");
                    this.loadTreeBitmapData(size, "white");
                    this.loadTreeBitmapData(size, "orange");
                    this.loadTreeBitmapData(size, "pink");
                    this.loadTreeBitmapData(size, "red");
                    this.loadTreeBitmapData(size, "blue");
                    this.loadTreeHighlightBitmapData(size, "green");
                    this.loadTreeHighlightBitmapData(size, "yellow");
                    this.loadTreeHighlightBitmapData(size, "white");
                    this.loadTreeHighlightBitmapData(size, "orange");
                    this.loadTreeHighlightBitmapData(size, "pink");
                    this.loadTreeHighlightBitmapData(size, "red");
                    this.loadTreeHighlightBitmapData(size, "blue");
                }
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            static generateTrees(game, map, mapMaskBmd, treeColors, players) {
                const trees = [];
                const chunkSide = 100;
                const chunks = [];
                for (let cx = 0; cx < map.width / chunkSide; cx++) {
                    chunks[cx] = [];
                    for (let cy = 0; cy < map.height / chunkSide; cy++) {
                        chunks[cx][cy] = [];
                    }
                }
                let failedCount = 0;
                while (failedCount < 750) {
                    const treeData = {
                        x: Math.floor(map.x + map.width * Math.random()),
                        y: Math.floor(map.y + map.height * Math.random()),
                        size: Math.floor(8 + 30 * Math.random() * Math.random() * Math.random() * Math.random()),
                        color: Client.getRandomElement(treeColors),
                    };
                    const cx = Math.floor((treeData.x - map.x) / chunkSide);
                    const cy = Math.floor((treeData.y - map.y) / chunkSide);
                    function dist(a, b) {
                        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
                    }
                    let allowed = true;
                    for (let dcx = -1; dcx <= 1; dcx++) {
                        for (let dcy = -1; dcy <= 1; dcy++) {
                            const chunk = (chunks[cx + dcx] || [])[cy + dcy] || [];
                            allowed = !chunk.find(t => dist(treeData, t.data) < (t.data.size + treeData.size));
                            if (!allowed) {
                                break;
                            }
                        }
                        if (!allowed) {
                            break;
                        }
                    }
                    allowed = allowed && mapMaskBmd.getPixel32(treeData.x, treeData.y) === 4278190080;
                    if (allowed) {
                        failedCount = 0;
                        const tree = new Client.Tree(game, treeData);
                        const chunk = chunks[cx][cy] = (chunks[cx] || [])[cy] || [];
                        chunk.push(tree);
                        trees.push(tree);
                    }
                    else {
                        failedCount++;
                    }
                }
                players.forEach(player => {
                    const tree = Client.getRandomElement(trees);
                    player.baseTrees.push(tree);
                    tree.owner = player;
                });
                return trees;
            }
            static processTrees(trees) {
                trees.forEach(tree => {
                    function dist(a, b) {
                        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
                    }
                    const closeTrees = trees
                        .filter(t => tree !== t && dist(t.data, tree.data) < 2.5 * (t.data.size + tree.data.size))
                        .sort((at, bt) => dist(tree.data, at.data) - dist(tree.data, bt.data));
                    let hiddenTrees = [];
                    for (let i = 0; i < closeTrees.length; i++) {
                        const t = closeTrees[i];
                        const dt = new Phaser.Point(t.data.x - tree.data.x, t.data.y - tree.data.y);
                        const at = Math.asin(t.data.size / dt.getMagnitude());
                        hiddenTrees = hiddenTrees.concat(closeTrees
                            .slice(i + 1)
                            .filter(t2 => {
                            const dt2 = new Phaser.Point(t2.data.x - tree.data.x, t2.data.y - tree.data.y);
                            const at2 = Math.asin(t2.data.size / dt2.getMagnitude());
                            const minAllowedAngle = at + at2;
                            var a = Math.acos(dt.dot(dt2) / (dt.getMagnitude() * dt2.getMagnitude()));
                            return a < minAllowedAngle;
                        }));
                    }
                    closeTrees
                        .filter(t => hiddenTrees.indexOf(t) < 0)
                        .forEach(t => {
                        tree.neighbours.push(t);
                        t.neighbours.push(tree);
                    });
                });
            }
            create() {
                this.time.advancedTiming = true;
                this.scale.pageAlignVertically = true;
                this.scale.pageAlignHorizontally = true;
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = this.add.sprite(0, 0, 'map1');
                this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.mapMaskBmd.draw('map1-mask', 0, 0);
                this.mapMaskBmd.update();
                this.humanPlayer = new Client.Player(this.game, "red");
                this.players = [this.humanPlayer, new Client.Player(this.game, "blue")];
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.trees = Level01.generateTrees(this.game, this.map, this.mapMaskBmd, this.treeColors, this.players);
                Level01.processTrees(this.trees);
                this.connectionLinesBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.trees.forEach(tree => {
                    tree.neighbours.forEach(t => {
                        this.connectionLinesBmd.context.beginPath();
                        this.connectionLinesBmd.context.moveTo(tree.data.x, tree.data.y);
                        this.connectionLinesBmd.context.lineTo(t.data.x, t.data.y);
                        this.connectionLinesBmd.context.strokeStyle = "rgba(0, 0, 0, .2)";
                        this.connectionLinesBmd.context.stroke();
                    });
                });
                this.connectionLinesBmd.update();
                this.connectionLines = this.add.sprite(0, 0, this.connectionLinesBmd);
                this.connectionLines.z = 1000;
                this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                this.players.forEach(player => {
                    player.turn(player.baseTrees[0].data.color);
                });
                this.trees.forEach(tree => tree.fin());
                this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 80, 10 + i * 25, (player.score(null) / this.fullScore * 100).toPrecision(2) + "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
                    btn.inputEnabled = true;
                    btn.events.onInputUp.add(() => { this.playerTurn(color); }, this);
                    btn.events.onInputOver.add(() => {
                        this.humanPlayer.walkTrees(tree => {
                            if (tree.owner !== this.humanPlayer) {
                                tree.highlightColor = this.humanPlayer.color;
                            }
                            return tree.neighbours
                                .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
                        });
                    }, this);
                    btn.events.onInputOut.add(() => {
                        this.humanPlayer.walkTrees(tree => {
                            if (tree.owner !== this.humanPlayer) {
                                tree.highlightColor = null;
                            }
                            return tree.neighbours
                                .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
                        });
                    }, this);
                    return btn;
                });
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));
            }
            playerTurn(color) {
                this.turn(this.humanPlayer, color);
                this.turn(this.players[1], this.treeColors
                    .reduce((a, b) => (this.players[1].score(a) > this.players[1].score(b)) ? a : b));
                this.players.map((player, i) => this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
            }
            turn(player, color) {
                player.turn(color);
                const reachable = new Set();
                this.players.forEach(p => {
                    if (p === player) {
                        return;
                    }
                    p.walkTrees(tree => {
                        reachable.add(tree);
                        return tree.neighbours
                            .filter(t => (t.owner === null) || (t.owner === p));
                    });
                });
                player.walkTrees((tree, step) => {
                    if (tree.owner === null) {
                        tree.colorWaves.push({
                            start: this.game.time.time,
                            step: step,
                            color: color.color,
                            justOwned: tree.owner !== player
                        });
                    }
                    if (tree.owner !== player) {
                        tree.owner = player;
                        tree.highlightColor = player.color;
                    }
                    tree.data.color = color;
                    return tree.neighbours
                        .filter(t => !reachable.has(t));
                });
            }
            render() {
                this.game.debug.text("fps" + this.game.time.fps.toFixed(2), 2, 14, "white");
            }
            update() {
                this.trees.forEach(tree => tree.update());
            }
        }
        Client.Level01 = Level01;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class MainMenu extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('singlePlayerBtn', './assets/ui/singlePlayerBtn.png');
                this.load.image('hostGameBtn', './assets/ui/hostGameBtn.png');
                this.load.image('joinGameBtn', './assets/ui/joinGameBtn.png');
            }
            create() {
                this.singlePlayerBtn = this.add.button(this.world.centerX, this.world.centerY - 70, "singlePlayerBtn", () => this.game.state.start('Level01', true, false));
                this.singlePlayerBtn.anchor.set(0.5);
                this.hostGameBtn = this.add.button(this.world.centerX, this.world.centerY - 0, "hostGameBtn", () => this.game.state.start('HostGame', true, false));
                this.hostGameBtn.anchor.set(0.5);
                this.joinGameBtn = this.add.button(this.world.centerX, this.world.centerY + 70, "joinGameBtn", () => this.game.state.start('JoinGame', true, false));
                this.joinGameBtn.anchor.set(0.5);
            }
        }
        Client.MainMenu = MainMenu;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Preloader extends Phaser.State {
            preload() {
                this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...", { font: "18px Arial", fill: "#FFFFFF", align: "center" });
                this.loaderText.anchor.setTo(0.5);
                this.load.image('titlepage', './assets/ui/titlePage.png');
                this.load.image('logo', './assets/ui/gameLogo.png');
                this.load.audio('click', './assets/sounds/click.ogg', true);
                this.load.atlasJSONHash('level01-sprites', './assets/sprites/level01-sprites.png', './assets/sprites/level01-sprites.json');
            }
            create() {
                var tween = this.add.tween(this.loaderText).to({ alpha: 0 }, 20, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(this.startMainMenu, this);
            }
            startMainMenu() {
                this.game.state.start('MainMenu', true, false);
            }
        }
        Client.Preloader = Preloader;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        function getRandomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        Client.getRandomElement = getRandomElement;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Player_obs {
            constructor(game, color) {
                this.game = game;
                this.color = color;
                this.baseTrees = [];
            }
            walkTrees(fn) {
                const visited = new Set();
                const queue = this.baseTrees.map(tree => ({ tree, step: 0 }));
                while (queue.length > 0) {
                    const entry = queue.shift();
                    if (visited.has(entry.tree)) {
                        continue;
                    }
                    visited.add(entry.tree);
                    fn(entry.tree, entry.step)
                        .forEach(t => queue.push({ tree: t, step: entry.step + 1 }));
                }
            }
            turn(color) {
                this.walkTrees((tree, step) => {
                    tree.switchStart = this.game.time.time;
                    if (tree.owner === this) {
                        tree.switchOrder = -1;
                        tree.blinkOrder = step;
                    }
                    else {
                        tree.switchOrder = step;
                        tree.blinkOrder = -1;
                        tree.owner = this;
                    }
                    tree.color = color;
                    return tree.neighbours
                        .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
                });
            }
            score(color) {
                let score = 0;
                this.walkTrees(tree => {
                    score += tree.score;
                    return tree.neighbours
                        .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
                });
                return score;
            }
        }
        Client.Player_obs = Player_obs;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
//# sourceMappingURL=game.js.map