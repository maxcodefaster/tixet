export default (address: string) => {
  return address
    .substring(0, 7)
    .concat("...")
    .concat(address.substring(address.length - 4));
};
