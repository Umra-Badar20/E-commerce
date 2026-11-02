export async function apiRequest(url, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }
  return data
}