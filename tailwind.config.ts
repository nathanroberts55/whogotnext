import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import daisyui from 'daisyui';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		fontFamily: {
			display: ['Modak'],
		},
		extend: {}
	},
	plugins: [typography, forms, containerQueries, aspectRatio, daisyui],
	daisyui: {
		themes:["luxury"],
		logs: false,
	}
} satisfies Config;
