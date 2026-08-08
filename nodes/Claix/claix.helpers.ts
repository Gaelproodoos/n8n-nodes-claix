/** Production API base URL — matches OpenAPI server + public documentation. */
export const CLAIX_API_BASE_URL = 'https://www.claix.dev/api';

export const OPERATION_ENDPOINTS = {
	extractPdfToJson: '/pdf-json',
	extractDocToJson: '/doc-json',
	extractExcelToJson: '/excel-json',
} as const;

export type ClaixOperation = keyof typeof OPERATION_ENDPOINTS;

type MultipartFileField = {
	buffer: Buffer;
	filename: string;
	mimeType: string;
};

export function isClaixOperation(operation: string): operation is ClaixOperation {
	return operation in OPERATION_ENDPOINTS;
}

export function buildMultipartBody(
	fields: Record<string, string>,
	file: MultipartFileField,
): { body: Buffer; contentType: string } {
	const boundary = `----ClaixForm${Date.now()}${Math.random().toString(16).slice(2)}`;
	const chunks: Buffer[] = [];

	for (const [name, value] of Object.entries(fields)) {
		chunks.push(
			Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
			),
		);
	}

	const safeFilename = file.filename.replace(/"/g, '');
	chunks.push(
		Buffer.from(
			`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${safeFilename}"\r\nContent-Type: ${file.mimeType}\r\n\r\n`,
		),
	);
	chunks.push(file.buffer);
	chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

export function getOperationEndpoint(operation: ClaixOperation): string {
	return `${CLAIX_API_BASE_URL}${OPERATION_ENDPOINTS[operation]}`;
}

export function getDefaultFilename(operation: ClaixOperation, originalFilename?: string): string {
	if (originalFilename) {
		return originalFilename;
	}

	switch (operation) {
		case 'extractPdfToJson':
			return 'document.pdf';
		case 'extractDocToJson':
			return 'document.docx';
		case 'extractExcelToJson':
			return 'spreadsheet.xlsx';
		default:
			return 'document.bin';
	}
}

export function getDefaultMimeType(operation: ClaixOperation, mimeType?: string): string {
	if (mimeType) {
		return mimeType;
	}

	switch (operation) {
		case 'extractPdfToJson':
			return 'application/pdf';
		case 'extractDocToJson':
			return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		case 'extractExcelToJson':
			return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		default:
			return 'application/octet-stream';
	}
}
