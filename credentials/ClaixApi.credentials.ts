import type {
	IAuthenticateGeneric,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

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
}
