import React from 'react';
interface HeaderProps {
    provider: string;
    model: string;
    endpoint: string;
    profile: string;
    connected: boolean;
}
/**
 * Main header displayed at the top of the terminal.
 * Shows ASCII art title, connection info box, and status indicator.
 */
export declare function Header({ provider, model, endpoint, profile, connected }: HeaderProps): React.ReactElement;
export {};
//# sourceMappingURL=header.d.ts.map