export const DEFAULT_ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    SELLER: 'Vendedor',
};

export function getRoleLabels(): Record<string, string> {
    try {
        const custom = JSON.parse(localStorage.getItem('roles') || '{}');
        return { ...DEFAULT_ROLE_LABELS, ...custom };
    } catch (error) {
        return { ...DEFAULT_ROLE_LABELS };
    }
}

export function roleLabel(code: string): string {
    const labels = getRoleLabels();
    return labels[code] ?? code;
}

export function roleListLabel(code: string[] = []): string {
    return code.map(roleLabel).join(', ');
}