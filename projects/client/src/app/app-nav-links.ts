export interface NavLink {
    name: string;
    url: string;
}

export const navLinks: NavLink[] = [
    {
        name: 'Home',
        url: '/',
    },
    {
        name: 'Browse',
        url: '/ppt/browse',
    },
    {
        name: 'Server',
        url: '/ppt/server',
    },
    {
        name: 'JS',
        url: '/ppt/js',
    },
    {
        name: 'MetaII',
        url: '/ppt/metaii',
    }
];
