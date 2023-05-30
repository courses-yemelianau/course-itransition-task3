import { createHmac, randomBytes } from 'crypto';
import { GeneratorInterface } from '../interfaces/GeneratorInterface';

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

export default Generator;
