import { createInterface } from 'readline';
import { randomBytes, createHmac } from 'crypto';

const CliTable = require('cli-table');

enum Results {
    Draw,
    Win,
    Lose
}

interface GeneratorInterface {
    generateKey(): string;

    generateHmac(key: string, data: string): string;
}

interface RulesInterface {
    isValidMove(move: string | number): boolean;

    determineWinner(userMove: string, computerMove: string): number;
}

interface TableInterface {
    printTable(): void;
}

interface GameInterface {
    playGame(): Promise<void>;

    displayMenu(): void;

    displayResult(): void;

    displayHelp(): void;
}

class Generator implements GeneratorInterface {
    generateKey(): string {
        return randomBytes(32).toString('hex');
    }

    generateHmac(key: string, data: string): string {
        const hmac = createHmac('sha256', key);
        hmac.update(data);
        return hmac.digest('hex');
    }
}

class Rules implements RulesInterface {
    private moves: string[];

    constructor(moves: string[]) {
        this.moves = moves;
    }

    isValidMove(move: string | number): boolean {
        const moveIndex = parseInt(move.toString());
        return this.isNumeric(moveIndex) && this.isWithinRange(moveIndex);
    }

    private isNumeric(value: number): boolean {
        return !isNaN(value);
    }

    private isWithinRange(value: number): boolean {
        return value >= 1 && value <= this.moves.length;
    }

    determineWinner(userMove: string, computerMove: string): number {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const length = this.moves.length;
        switch (computerIndex) {
            case userIndex:
                return Results.Draw;
            case (userIndex + 1) % length:
            case (userIndex + ~~(length / 2)) % length:
                return Results.Lose;
            default:
                return Results.Win;
        }
    }
}

class Table implements TableInterface {
    private readonly results: string[];
    private readonly moves: string[];
    private rules: RulesInterface;
    private readonly table: string[][];

    constructor(moves: string[], rules: RulesInterface) {
        this.results = ['Draw', 'Win', 'Lose'];
        this.moves = moves;
        this.rules = rules;
        this.table = this.generateTable();
    }

    private generateTable(): string[][] {
        const table = new CliTable();
        table.push(['Moves', ...this.moves]);
        this.moves.forEach((userMove: string) => {
            const row: string[] = this.generateRow(userMove);
            table.push(row);
        });
        return table;
    }

    private generateRow(userMove: string): string[] {
        const row: string[] = [userMove];
        const cells: string[] = this.moves.map((computerMove: string) => this.generateCell(userMove, computerMove));
        row.push(...cells);
        return row;
    }

    private generateCell(userMove: string, computerMove: string): string {
        const winner = this.rules.determineWinner(userMove, computerMove);
        return this.results[winner];
    }

    printTable(): void {
        console.log(this.table.toString());
    }
}

class Game implements GameInterface {
    private readonly results: string[];
    moves: string[];
    generator: GeneratorInterface;
    rules: RulesInterface;
    table: TableInterface;
    private key: string;
    private hmac: string;
    private computerMove: string;
    private userMove: string;
    result: string;

    constructor(moves: string[], generator: GeneratorInterface, rules: RulesInterface, table: TableInterface) {
        this.results = ['Draw!', 'You Win!', 'You Lose!'];
        this.moves = moves;
        this.generator = generator;
        this.rules = rules;
        this.table = table;
    }

    private getRandomMove(): number {
        return ~~(Math.random() * this.moves.length);
    }

    private generateComputerMove(): void {
        this.key = this.generator.generateKey();
        this.computerMove = this.moves[this.getRandomMove()];
        this.hmac = this.generator.generateHmac(this.key, this.computerMove);
    }

    private async getUserInput(): Promise<string> {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question('Enter your move: ', (input: string) => {
                rl.close();
                resolve(input);
            });
        });
    }

    private play(userMoveIndex: number): void {
        this.userMove = this.moves[userMoveIndex - 1];
        const winner = this.rules.determineWinner(this.userMove, this.computerMove);
        this.result = this.results[winner];
    }

    async playGame(): Promise<void> {
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

    displayMenu(): void {
        console.log(`HMAC: ${this.hmac}`);
        console.log('Available moves:');
        this.moves.forEach((move: string, index: number) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }

    displayResult(): void {
        console.log(`Your move: ${this.userMove}`);
        console.log(`Computer move: ${this.computerMove}`);
        console.log(this.result);
        console.log(`HMAC key: ${this.key}`);
        console.log();
    }

    displayHelp(): void {
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
