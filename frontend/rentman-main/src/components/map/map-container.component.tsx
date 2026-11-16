import React from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility";
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

const MapContainerComponent = () => {
    return (
        <MapContainer
            center={[-37.840935, 144.946457]}
            zoom={16}
            style={{ height: '400px', width: '100%', zIndex: 0 }}
            zoomControl={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[-37.840935, 144.946457]}>
                <Popup>
                    Nainwe lianeil, Mki Kagrsd Pci Rd. Karvidio, USA
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapContainerComponent;
