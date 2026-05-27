export function assertOrderInput(order = {}) {
  const errors = [];
  const symbol = String(order.symbol || '').trim();
  const side = String(order.side || '').toLowerCase();
  const quantity = Number(order.quantity);
  const price = Number(order.price || 0);
  const mode = String(order.mode || 'paper').toLowerCase();

  if (!/^[A-Za-z0-9_./:-]{3,40}$/.test(symbol)) errors.push('symbol must be 3-40 safe characters');
  if (!['buy', 'sell'].includes(side)) errors.push('side must be buy or sell');
  if (!Number.isFinite(quantity) || quantity <= 0) errors.push('quantity must be a positive number');
  if (order.price !== undefined && order.price !== '' && (!Number.isFinite(price) || price < 0)) errors.push('price must be a non-negative number');
  if (!['paper', 'live'].includes(mode)) errors.push('mode must be paper or live');
  if (Number.isFinite(quantity) && Number.isFinite(price) && price > 0 && quantity * price > 250000) errors.push('demo notional is capped at 250,000 USDC');

  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    throw err;
  }
  return { ...order, symbol, side, quantity: String(quantity), price: String(price || order.price || ''), mode };
}
