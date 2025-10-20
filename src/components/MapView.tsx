import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState, useMemo } from 'react'
import L from 'leaflet'

// Fix default marker icon paths for bundlers
import marker2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerUrl,
  iconRetinaUrl: marker2xUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = defaultIcon

export function MapView({ name, lat, lng, importance }: { name: string; lat?: number; lng?: number; importance?: 1|2|3 }){
  // Track current theme by reading data-theme attribute to switch basemap
  const readTheme = () => (document?.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light') as 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setTheme(readTheme()))
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    if (importance === 1) {
      return <div className="text-[var(--muted)] text-sm">重要度1の地名は座標を提供していないため、地図は表示されません。</div>
    }
    return <div className="text-[var(--muted)] text-sm">位置情報が未登録のため、地図を表示できません。</div>
  }
  const center: [number, number] = [lat, lng]
  const tileUrl = useMemo(
    () => (theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'),
    [theme]
  )
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: 320, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={theme}
          url={tileUrl}
          subdomains={["a", "b", "c", "d"]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Marker position={center}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default MapView
