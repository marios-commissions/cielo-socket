import { setTimeout } from 'node:timers/promises';
import WebSocket from 'ws';

import { notify } from './api';


let socket: WebSocket;

export function createWebSocket() {
	if (socket) return;

	console.log('Attempting to connect to WebSocket...');

	socket = new WebSocket('wss://feed-api.cielo.finance/api/v1/ws', {
		headers: {
			'X-Api-Key': process.env.API_KEY
		}
	});


	socket.on('message', (data) => {
		try {
			const payload = JSON.parse(data as any);

			switch (payload.type) {
				case 'tx': {
					notify(payload.data as TransactionData);
				} break;

				case 'feed_subscribed': {
					console.log('Successfully subscribed to feed.');
				} break;
			}
		} catch (error) {
			console.error('Failed to parse message from Cielo WebSocket:', error);
		}
	});

	socket.on('open', () => {
		console.log('WebSocket connected.');

		socket.send(JSON.stringify({
			type: 'subscribe_feed',
			filter: {
				tx_types: ['swap'],
				new_trade: true
			}
		}));
	});

	socket.on('close', async () => {
		console.log(`WebSocket closed. Attempting reconnect in 5000ms`);
		await setTimeout(5000);
		createWebSocket();
	});
}