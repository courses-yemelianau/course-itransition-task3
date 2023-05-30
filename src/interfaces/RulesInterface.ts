export interface RulesInterface {
    isValidMove(move: string | number): boolean;

    determineWinner(userMove: string, computerMove: string): number;
}
