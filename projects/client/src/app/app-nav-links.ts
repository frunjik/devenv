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
        name: 'JS',
        url: '/ppt/js',
    },
    {
        name: 'Server',
        url: '/ppt/server',
    },
    {
        name: 'MetaII',
        url: '/ppt/metaii',
    }
];
