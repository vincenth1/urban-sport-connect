
// Minimal IPFS helpers; uses web3.storage if token provided, otherwise falls back to a mock upload

const PINATA_PROXY_BASE = import.meta.env.VITE_PINATA_PROXY_BASE || 'http://localhost:3001/pinata';

export const uploadToIPFS = async (
  data: any,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Use Pinata JSON pinning via local proxy that injects API keys
  const endpoint = `${PINATA_PROXY_BASE}/pinning/pinJSONToIPFS`;
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error('IPFS upload failed');
  const out = await res.json();
  const cid = out && (out.IpfsHash || out.ipfsHash || out.Hash);
  if (!cid) throw new Error('Pinata response missing IpfsHash');
  return `ipfs://${cid}`;
};

export const fetchFromIPFS = async (uri: string): Promise<any> => {
  // Supports ipfs://CID or https urls
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    const url = `https://ipfs.io/ipfs/${cid}`;
    const r = await fetch(url);
    return await r.json();
  } else {
    const r = await fetch(uri);
    return await r.json();
  }
};

export const updateIPFSJson = async (existingUri: string, updates: Record<string, any>) => {
  const current = await fetchFromIPFS(existingUri);
  const next = { ...current, ...updates };
  return await uploadToIPFS(next);
};

// Simple in-memory cache for IPFS JSON responses to avoid repeated network calls
const ipfsJsonCache = new Map<string, any>();
export const fetchFromIPFSMemo = async (uri: string): Promise<any> => {
  if (ipfsJsonCache.has(uri)) return ipfsJsonCache.get(uri);
  const data = await fetchFromIPFS(uri);
  ipfsJsonCache.set(uri, data);
  return data;
};

export const prepareCourseMetadata = (courseData: any) => {
    return {
      name: courseData.title,
      description: courseData.description,
      image: courseData.image,
      // Include data as direct properties for easier access
      timeStart: courseData.timeStart || '',
      timeEnd: courseData.timeEnd || '',
      location: courseData.location || '',
      sportType: courseData.sportType || 'OTHER',
      capacity: courseData.capacity || undefined,
      attributes: [
        { trait_type: "Price", value: courseData.price },
        { trait_type: "Sport Type", value: courseData.sportType },
        { trait_type: "Location", value: courseData.location },
        { trait_type: "TimeStart", value: courseData.timeStart || '' },
        { trait_type: "TimeEnd", value: courseData.timeEnd || '' },
        { trait_type: "Trainer", value: courseData.trainer },
        { trait_type: "Capacity", value: courseData.capacity || '' }
      ]
    };
  };
