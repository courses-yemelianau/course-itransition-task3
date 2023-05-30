import Generator from './classes/Generator';
import Rules from './classes/Rules';
import Table from './classes/Table';
import Game from './classes/Game';
import { validateArguments } from './utils';

const args = process.argv.slice(2);

function main(args) {
    if (validateArguments(args)) {
        const moves = args;
        const generator = new Generator();
        const rules = new Rules(moves);
        const table = new Table(moves, rules);
        const game = new Game(moves, generator, rules, table);
        game.playGame();
    }
}

main(args);
