// Handle negative numbers and wrapping properly
export function properModulo(x: number, m: number): number {
    const rem = x % m;
    if (rem < 0) {
        return m + rem;
    } else {
        return rem;
    }
}