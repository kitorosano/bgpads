import { networkInterfaces } from 'os';

export interface NetworkAddress {
  name: string;
  address: string;
}

export const getLanAddresses = (): NetworkAddress[] => {
  const interfaces = networkInterfaces();
  const addresses: NetworkAddress[] = [];

  for (const [name, networkInterface] of Object.entries(interfaces)) {
    if (!networkInterface) continue;

    for (const info of networkInterface) {
      if (info.family !== 'IPv4' || info.internal) continue;

      addresses.push({
        name,
        address: info.address
      });
    }
  }

  return addresses;
};

const isPrivateLanAddress = (address: string): boolean => {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

  const [a, b] = parts;

  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};

const isVirtualInterface = (name: string): boolean => {
  const normalizedName = name.toLowerCase();

  return (
    normalizedName.includes('tailscale') ||
    normalizedName.includes('wsl') ||
    normalizedName.includes('vethernet') ||
    normalizedName.includes('virtualbox') ||
    normalizedName.includes('vmware') ||
    normalizedName.includes('hyper-v')
  );
};

export const getPreferredLanAddress = (): NetworkAddress | null => {
  const addresses = getLanAddresses();

  return (
    addresses.find(
      ({ name, address }) => isPrivateLanAddress(address) && !isVirtualInterface(name)
    ) ?? null
  );
};
