import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type UserLocation = {
  id: string
  name: string
  lat: number
  lng: number
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function LiveMap({ users }: { users: UserLocation[] }) {
  return (
    <MapContainer
      center={[-15.795, -47.891]}
      zoom={13}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {users.map((user, index) => (
        <Marker key={index} position={[user.lat, user.lng]}>
          <Popup>{user.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}