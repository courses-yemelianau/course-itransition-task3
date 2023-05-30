import { TableInterface } from '../interfaces/TableInterface';
import { RulesInterface } from '../interfaces/RulesInterface';

const CliTable = require('cli-table');

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

export default Table;
