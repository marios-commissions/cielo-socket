import { BASE_URL, HistoryType, PrimaryTokens } from './constants';


export async function notify(transaction: TransactionData) {
	const details = getTransactionDetails(transaction);

	const response = await fetch(BASE_URL + 'create/history', {
		method: 'POST',
		redirect: 'follow',
		body: JSON.stringify(details),
		headers: {
			'Content-Type': 'application/json'
		},
	});

	if (response.status == 200) {
		console.log(`Notifying for ${details.type.toUpperCase()} (${details.context.amount} ${details.context.currency}) of ${details.index == 0 ? transaction.token1_name : transaction.token0_name} (${details.token_address})`);
	} else {
		console.log(`Failed to notify for ${details.type.toUpperCase()} (${details.context.amount} ${details.context.currency}) of ${details.index == 0 ? transaction.token1_name : transaction.token0_name} (${details.token_address})`);
	}
}

export function getTransactionDetails(transaction: TransactionData) {
	const primary = findPrimaryToken(transaction);

	return {
		...primary,
		type: primary.index == 1 ? HistoryType.SELL : HistoryType.BUY,
		chain: transaction.chain,
		token_address: primary.index == 0 ? transaction.token1_address : transaction.token0_address,
		context: {
			wallet_address: transaction.wallet,
			username: transaction.wallet_label ?? 'Unknown',
			amount: primary.amount,
			currency: primary.type,
			url: `https://app.cielo.finance/profile/${transaction.wallet}`
		}
	};
}

export function findPrimaryToken(transaction: TransactionData) {
	for (let i = 0; i < PrimaryTokens.length; i++) {
		const token = PrimaryTokens[i];
		if (!token) continue;

		if (token.symbol === transaction.token0_symbol) {
			return { index: 0, type: token.type, amount: transaction.token0_amount };
		};

		if (token.symbol === transaction.token1_symbol) {
			return { index: 1, type: token.type, amount: transaction.token1_amount };
		}
	}

	// Fallback
	return { index: 0, type: 'Unknown', amount: transaction.token0_amount };
}