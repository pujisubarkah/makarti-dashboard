/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'dtjrketxxozstcwvotzh.supabase.co',
			},
		],
	},
};

module.exports = nextConfig
