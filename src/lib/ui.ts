export const btnPrimary = 'btn btn-primary';
export const btnSecondary = 'btn btn-secondary';
export const btnToggle = (active: boolean) => (active ? btnPrimary : btnSecondary);
export const chip = (on: boolean) => `chip ${on ? 'chip-on' : ''}`;
