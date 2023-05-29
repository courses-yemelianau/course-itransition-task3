const readline = require('readline');
const crypto = require('crypto');

class Generator {
    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateHmac(key, data) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(data);
        return hmac.digest('hex');
    }
}

class Rules {
    constructor(moves) {
        this.moves = moves;
    }

    isValidMove(move) {
        const moveIndex = parseInt(move);
        return this.isNumeric(moveIndex) && this.isWithinRange(moveIndex);
    }

    isNumeric(value) {
        return !isNaN(value);
    }

    isWithinRange(value) {
        return value >= 1 && value <= this.moves.length;
    }

    determineWinner(userMove, computerMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const length = this.moves.length;
        switch (computerIndex) {
            case userIndex:
                return 0;
            case (userIndex + 1) % length:
            case (userIndex + ~~(length / 2)) % length:
                return 2;
            default:
                return 1;
        }
    }
}

class Table {
    constructor(moves, rules) {
        this.results = ['Draw', 'Win', 'Lose'];
        this.moves = moves;
        this.rules = rules;
        this.table = this.generateTable();
    }

    generateTable() {
        const table = [['Moves', ...this.moves]];
        const rows = this.moves.reduce((acc, userMove) => {
            const row = this.generateRow(userMove);
            acc.push(row);
            return acc;
        }, []);
        table.push(...rows);
        return table;
    }

    generateRow(userMove) {
        const row = [userMove];
        const cells = this.moves.map(computerMove => this.generateCell(userMove, computerMove));
        row.push(...cells);
        return row;
    }

    generateCell(userMove, computerMove) {
        const winner = this.rules.determineWinner(userMove, computerMove);
        return this.results[winner];
    }

    printTable() {
        console.table(this.table);
    }
}

class Game {
    constructor(moves, generator, rules, table) {
        this.results = ['Draw!', 'You Win!', 'You Lose!'];
        this.moves = moves;
        this.generator = generator;
        this.rules = rules;
        this.table = table;
    }

    getRandomMove() {
        return ~~(Math.random() * this.moves.length);
    }

    generateComputerMove() {
        this.key = this.generator.generateKey();
        this.computerMove = this.moves[this.getRandomMove()];
        this.hmac = this.generator.generateHmac(this.key, this.computerMove);
    }

    async getUserInput() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question('Enter your move: ', (input) => {
                rl.close();
                resolve(input);
            });
        });
    }

    play(userMoveIndex) {
        this.userMove = this.moves[userMoveIndex - 1];
        const winner = this.rules.determineWinner(this.userMove, this.computerMove);
        this.result = this.results[winner];
    }

    async playGame() {
        this.generateComputerMove();
        while (true) {
            this.displayMenu();
            const userInput = await this.getUserInput();
            if (userInput === '?') {
                this.displayHelp();
                continue;
            }
            const userMoveIndex = parseInt(userInput);
            if (userMoveIndex === 0) {
                console.log('Exiting the game.');
                return;
            }
            if (!this.rules.isValidMove(userMoveIndex)) {
                console.log('Invalid move!');
                continue;
            }
            this.play(userMoveIndex);
            this.displayResult();
            break;
        }
        await this.playGame();
    }

    displayMenu() {
        console.log(`HMAC: ${this.hmac}`);
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }

    displayResult() {
        console.log(`Your move: ${this.userMove}`);
        console.log(`Computer move: ${this.computerMove}`);
        console.log(this.result);
        console.log(`HMAC key: ${this.key}`);
        console.log();
    }

    displayHelp() {
        this.table.printTable();
    }
}

const args = process.argv.slice(2);
if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.error('Invalid arguments! Please provide an odd number of unique moves.');
    console.log('Example: node game.js rock paper scissors');
} else {
    const moves = args;
    const generator = new Generator();
    const rules = new Rules(moves);
    const table = new Table(moves, rules);
    const game = new Game(moves, generator, rules, table);
    game.playGame();
}
