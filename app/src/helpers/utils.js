export const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const copyText = async (num) => {
    try {
      await navigator.clipboard.writeText(num);
    } catch (err) {}
};

export const formatAddress = (address) => {
    let text;
    if (address) {
      let firstHalf = address.slice(0, 5);
      let secondHalf = address.slice(-5);
      text = firstHalf + '...' + secondHalf;
      return text;
    }
    text = 'Address unavailable';
    return text;
  };