import { createInterface } from 'readline';
import { GameInterface } from '../interfaces/GameInterface';
import { GeneratorInterface } from '../interfaces/GeneratorInterface';
import { RulesInterface } from '../interfaces/RulesInterface';
import { TableInterface } from '../interfaces/TableInterface';

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

export default Game;
