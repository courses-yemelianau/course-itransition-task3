import { RulesInterface } from '../interfaces/RulesInterface';
import { Results } from '../enums';

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

export default Rules;
