import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

import { CLAIX_API_BASE_URL } from '../nodes/Claix/claix.helpers';

export class ClaixApi implements ICredentialType {
	name = 'claixApi';

	displayName = 'Claix API';

	icon: Icon = {
		light: 'file:../nodes/Claix/claix.svg',
		dark: 'file:../nodes/Claix/claix.dark.svg',
	};

	documentationUrl = 'https://www.claix.dev/documentation';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'Secret API key from your Claix dashboard. Sent as x-api-key header (recommended) or Authorization: Bearer',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: CLAIX_API_BASE_URL,
			url: '/pdf-json',
			method: 'POST',
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 400,
					message: 'Connection successful! Claix API key is valid',
				},
			},
		],
	};
}
