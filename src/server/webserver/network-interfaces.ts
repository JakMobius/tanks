import { networkInterfaces } from 'os';

let savedResults: string[] | null = null;

export function getLocalIPAddresses() {
    if(savedResults) return savedResults;

    const nets = networkInterfaces();
    const results: string[] = []

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            if (net.family === 'IPv4') {
                results.push(net.address)
            }
        }
    }

    savedResults = results;

    // Reset the saved results after 5 seconds
    setTimeout(() => {
        savedResults = null;
    }, 1000 * 5);

    return results;
}
