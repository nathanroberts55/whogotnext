import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    return json({
        name: 'sveltekit-tailwindcss-daisyui',
        version: '1.0.0',
        description: 'A SvelteKit project with Tailwind CSS and DaisyUI',
        repository: {
            type: 'git',
            url: ''
            },
        })
    };
    