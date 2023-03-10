import sharp from 'sharp';
import fs from 'fs/promises';
import { join } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const shouldUpload = process.argv.includes('--upload');

const processFile = async (file: string) => {
	const contents = await fs.readFile(`source/crests/${file}`);

	const pipeline = sharp(contents).png({ quality: 85});

	pipeline.clone().resize(120).toFile(`build/crests/120/${file}`);
	pipeline.clone().resize(60).toFile(`build/crests/60/${file}`);
};

const walk = async (path: string): Promise<string[]> => {
	let files: string[] = [];

	for (const file of await fs.readdir(path)) {
		const newFile = join(path, file);
		const isDirectory = (await fs.stat(newFile)).isDirectory();
		const newFiles = isDirectory ? await walk(newFile) : [newFile];

		files.push(...newFiles);
	}

	return files;
};

const upload = async (s3: S3Client, path: string) => {
	const command = new PutObjectCommand({
		Bucket: 'aws-frontend-sport',
		Key: join('football', path.substring(6)), // substring(6) - Remove `build/` prefix.
		Body: await fs.readFile(path),
	});

	await s3.send(command);
};

(async () => {
	const startTime = Date.now();
	console.log('🗑️  clearing old build files!');
	await fs.rm('build', { recursive: true, force: true });

	console.log('📁 creating output folders.');
	await fs.mkdir('build/crests/120', { recursive: true });
	await fs.mkdir('build/crests/60', { recursive: true });

	console.log('📋 copying source files to output folder.');
	await fs.cp('source', 'build', { recursive: true });

	console.log('🪄  compressing and resizing images.');

	const files = (await fs.readdir('source/crests/'))
		.filter((file) => file.endsWith('.png'))
		.map(processFile);

	await Promise.all(files);

	if (shouldUpload) {
		console.log('🪣  uploading files to S3 bucket.');

		const s3 = new S3Client({
			region: 'eu-west-1',
		});

		const files = await walk('build');

		await Promise.all(files.map((file) => upload(s3, file)));
	}

	console.log(`✨ done in ${Date.now() - startTime}ms`);
})();
