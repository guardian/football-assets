import sharp from 'sharp';
import fs from 'fs/promises';
import { join } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const shouldUpload = process.argv.includes('--upload');

const processFile = async (file: string) => {
	const contents = await fs.readFile(`source/crests/${file}`);

	sharp(contents).resize({ width: 120 }).png({ quality: 50}).toFile(`build/crests/120/${file}`);
	sharp(contents).resize({ width: 60 }).png({ quality: 50}).toFile(`build/crests/60/${file}`);
};

const walk = async (path: string): Promise<string[]> => {
	let files: string[] = [];

	for (const file of await fs.readdir(path)) {
		// Don't include hidden files
		if (file.startsWith('.')) {
			continue;
		}
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

const startTime = Date.now();
console.log('🗑️  clearing old build files!');
await fs.rm('build', { recursive: true, force: true });

console.log('📁 creating output folders.');
await fs.mkdir('build/crests/120', { recursive: true });
await fs.mkdir('build/crests/60', { recursive: true });

console.log('📋 copying source files to output folder.');
await fs.cp('source', 'build', { recursive: true });

console.log('🪄  compressing and resizing images.');

const imageFiles = (await fs.readdir('source/crests/'))
    .filter((file) => file.endsWith('.png'))
    .map(processFile);

await Promise.all(imageFiles);

if (shouldUpload) {
    console.log('🪣  uploading files to S3 bucket.');

    const s3 = new S3Client({
        region: 'eu-west-1',
    });

    const filesToUpload = await walk('build');

    await Promise.all(filesToUpload.map((file) => upload(s3, file)));
}

console.log(`✨ done in ${Date.now() - startTime}ms`);
