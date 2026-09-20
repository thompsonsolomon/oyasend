const PHOTON_URL = 'https://photon.komoot.io/api/'

export async function searchLocations(query, {
  latitude,
  longitude,
} = {}) {
  if (!query || query.trim().length < 2) {
    return []
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: '6',
  })

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    params.set('lat', String(latitude))
    params.set('lon', String(longitude))
  }

  const response = await fetch(
    `${PHOTON_URL}?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error('Unable to search locations.')
  }

  const data = await response.json()

  return (data.features || [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates

      if (!coordinates || coordinates.length < 2) {
        return null
      }

      const properties = feature.properties || {}

      const parts = [
        properties.name,
        properties.street,
        properties.city,
        properties.state,
        properties.country,
      ].filter(Boolean)

      return {
        id: feature.properties?.osm_id
          ? String(feature.properties.osm_id)
          : `${coordinates[0]}-${coordinates[1]}`,
        address: parts.join(', '),
        latitude: Number(coordinates[1]),
        longitude: Number(coordinates[0]),
      }
    })
    .filter(Boolean)
}