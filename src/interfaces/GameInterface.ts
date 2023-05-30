export interface GameInterface {
    playGame(): Promise<void>;

    displayMenu(): void;

    displayResult(): void;

    displayHelp(): void;
}
