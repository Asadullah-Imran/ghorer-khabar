export const getApiDocs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doc/swagger`);
  if (!res.ok) {
    throw new Error('Failed to fetch API docs');
  }
  return res.json();
};
