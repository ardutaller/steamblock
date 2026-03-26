const fs = require('fs');
const path = require('path');

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
	packagerConfig: {
		asar: true,
		afterCopyExtraResources: [
			(bPath, eVer, platform, arch, done) => {
				['translations', 'img', 'precompiled'].forEach(part => {
					let dirpath;
					if (platform == 'darwin') {
						dirPath = path.join(
							bPath, 'microblocks.app', 'Contents', 'Resources', 'webapp', part
						);
					} else {
						dirPath = path.join(bPath, 'resources', 'webapp', part);
					}
					fs.unlinkSync(dirPath); // remove failed symlink
					fs.mkdirSync(dirPath);
					fs.readdirSync(path.join(__dirname, '..', part)).forEach(file => {
						fs.cpSync(
							path.join(__dirname, '..', part, file),
							path.join(dirPath, file)
						);
					})
				});
				done();
			}
		],
		extraResource: [
			'../chromeApp/webapp',
		]
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-flatpak',
			config: {},
		},
		{
			name: '@electron-forge/maker-squirrel',
			config: {},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				format: 'ULFO'
			}
		}
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
