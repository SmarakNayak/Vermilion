// Number

// Adds commas as thousand separators to a number

export const addCommas = (num) => {
  if (num === null) return null;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Address

// Formats an address to show first and last 5 characters

export const formatAddress = (address) => {
  if (!address) return 'Address unavailable';
  const firstHalf = address.slice(0, 5);
  const secondHalf = address.slice(-5);
  return `${firstHalf}...${secondHalf}`;
};

// Units

// Converts satoshis to BTC with appropriate decimal places

export const formatSats = (sats) => {
  let btc = sats / Math.pow(10, 8);
  return {
    value: btc.toFixed(btc % 1 !== 0 ? 2 : 0),
    unit: 'BTC'
  };
};

// Formats byte sizes into human readable format (KB, MB, GB, TB)

export const shortenBytes = (n) => {
  const k = n > 0 ? Math.floor(Math.log10(n) / 3) : 0;
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'B';
  const count = Math.floor(n / Math.pow(1000, k));
  const decimal = n / Math.pow(1000, k) - count;
  const countString = decimal !== 0 ? (n / Math.pow(1000, k)).toFixed(2) : count.toString();
  return {
    value: countString,
    unit: rank === 'B' ? 'Bytes' : rank
  };
};

// Shortens large numbers using k/m suffixes

export const shortenRange = (num) => {
  const absNum = Math.abs(num);
  
  if (absNum < 1000) {
    return num.toString();
  } else if (absNum < 1000000) {
    return `${(num / 1000).toFixed(1)}k`;
  } else {
    return `${(num / 1000000).toFixed(1)}m`;
  }
};

// Date/Time

// Formats millisecond timestamp into human readable date/time

export const formatTimestampMs = (timestamp) => {
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

// Formats second timestamp into human readable date/time

export const formatTimestampSecs = (timestamp) => {
  return formatTimestampMs(timestamp * 1000);
};

// Formats timestamp into short date format

export const shortenDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
