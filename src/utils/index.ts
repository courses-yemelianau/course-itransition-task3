export function validateArguments(args): boolean {
    const { length } = args;
    const isError = length < 3 || length % 2 === 0 || new Set(args).size !== length;
    if (isError) {
        console.error('Invalid arguments! Please provide an odd number of unique moves.');
        console.log('Example: node game.js rock paper scissors');
    }
    return !isError;
}
