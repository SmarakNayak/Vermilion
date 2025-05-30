// Number

// Adds commas as thousand separators to a number

export const addCommas = (num) => {
  if (num == null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Address

// Formats an address to show first and last 5 characters

export const formatAddress = (address) => {
  if (!address || address === 'Failed to convert script to address: script is not a p2pkh, p2sh or witness program' || address.includes('script is not a p2pkh')) {
    return 'Unknown';
  }

  if (address === 'unbound') {
    return 'Unbound';
  }

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

export const formatSatsString = (sats) => {
  let btc = sats / Math.pow(10, 8);
  let string = btc.toFixed(btc % 1 !== 0 ? 2 : 0) + " BTC";
  return string;
};

export const formatSatsStringFull = (sats) => {
  let btc = sats / Math.pow(10, 8);
  let string = Number(btc.toFixed(8)) + " BTC";
  return string;
};

export const formatSatsToDollars = (sats, price) => {
  let btc = sats / Math.pow(10, 8);
  let dollars = btc * price;
  let string = "$" + dollars.toFixed(2); // Note: changed Number to toFixed to ensure dollar value always has two decimal points
  return string;
}

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

export const shortenBytesString = (n) => {
  const k = n > 0 ? Math.floor(Math.log10(n) / 3) : 0;
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'B';
  const rank_clean = rank === 'B' ? 'Bytes' : rank;
  const count = Math.floor(n / Math.pow(1000, k));
  const decimal = n / Math.pow(1000, k) - count;
  const countString = decimal !== 0 ? (n / Math.pow(1000, k)).toFixed(2) : count.toString();
  return countString + ' ' + rank_clean;
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

// Formats edition numbers, using commas for <10k and abbreviated k format for larger numbers

export const formatEditionRange = (num) => {
  const absNum = Math.abs(num);
  
  if (absNum < 10000) {
    return addCommas(num);
  } else {
    return `~${(num / 1000).toFixed(1)}k`;
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

// Formats timestamp into "time ago" format
// e.g. "5m", "2h", "1d"

export const calcTimeAgo = (timestamp) => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const diff = now - timestamp; // Difference in seconds

  if (diff < 3600) {
    // Less than 60 minutes
    const minutes = Math.floor(diff / 60);
    return `${minutes}m`;
  } else if (diff < 86400) {
    // Between 1 and 23 hours
    const hours = Math.floor(diff / 3600);
    return `${hours}h`;
  } else {
    // 24 hours or more
    const days = Math.floor(diff / 86400);
    return `${days}d`;
  }
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
