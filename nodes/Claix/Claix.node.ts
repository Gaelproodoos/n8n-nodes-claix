import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	buildMultipartBody,
	getDefaultFilename,
	getDefaultMimeType,
	getOperationEndpoint,
	isClaixOperation,
} from './claix.helpers';

export class Claix implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Claix',
		name: 'claix',
		icon: {
			light: 'file:claix.svg',
			dark: 'file:claix.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Extract structured JSON from PDF, document (.docx/.txt/.md/.rtf) and Excel/CSV files using Claix',
		defaults: {
			name: 'Claix',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'claixApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'document',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Extract PDF to JSON',
						value: 'extractPdfToJson',
						description: 'Extract structured data from a PDF (max 15 MB). Uses the PDF → JSON endpoint.',
						action: 'Extract pdf to json',
					},
					{
						name: 'Extract Document to JSON',
						value: 'extractDocToJson',
						description: 'Extract data from .docx, .txt, .md or .rtf (max 10 MB). Uses the Document → JSON endpoint.',
						action: 'Extract document to json',
					},
					{
						name: 'Extract Excel to JSON',
						value: 'extractExcelToJson',
						description: 'Transform .xlsx or .csv to JSON using your schema. Uses the Excel/CSV → JSON endpoint.',
						action: 'Extract excel to json',
					},
				],
				default: 'extractPdfToJson',
			},
			{
				displayName: 'Schema ID',
				name: 'schema_id',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 3c7a9f21-4b8e-4d1a-9c6f-2e0d8a5b7c4f',
				description:
					'UUID of the Claix schema (PDF, document or Excel/CSV → JSON type) that defines the output structure',
			},
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description:
					'Name of the binary property on the incoming item that contains the document file',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (!isClaixOperation(operation)) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation "${operation}". Expected extractPdfToJson, extractDocToJson or extractExcelToJson`,
						{ itemIndex },
					);
				}

				const schemaId = this.getNodeParameter('schema_id', itemIndex) as string;

				if (!schemaId.trim()) {
					throw new NodeOperationError(this.getNode(), 'Schema ID is required', {
						itemIndex,
					});
				}

				const binaryPropertyName = this.getNodeParameter(
					'binaryPropertyName',
					itemIndex,
				) as string;

				const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
				const fileBuffer = await this.helpers.getBinaryDataBuffer(
					itemIndex,
					binaryPropertyName,
				);

				const { body, contentType } = buildMultipartBody(
					{ schema_id: schemaId },
					{
						buffer: fileBuffer,
						filename: getDefaultFilename(operation, binaryData.fileName),
						mimeType: getDefaultMimeType(operation, binaryData.mimeType),
					},
				);

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'claixApi',
					{
						method: 'POST',
						url: getOperationEndpoint(operation),
						body,
						headers: {
							'Content-Type': contentType,
						},
						json: true,
					},
				);

				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
			}
		}

		return [returnData];
	}
}
