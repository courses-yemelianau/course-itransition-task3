export interface GeneratorInterface {
    generateKey(): string;

    generateHmac(key: string, data: string): string;
}
