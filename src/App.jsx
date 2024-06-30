import { useEffect, useState } from 'react'
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import './App.css'

function App() {

  const key = import.meta.env.VITE_API_KEY;
  const [position, setPosition] = useState({lat: 0.0, lng: 0.0});
  const [location, setLocation] = useState("")

  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(120);
  const [zoomCypher, setZoomCypher] = useState(0); // Using two states for zoom so that it's not reactively changing zoom input value during final calculations

  // FOV: higher is less zoomed, lower is more zoomed
  const handleZoom = (e) => {
    setZoomCypher(e.target.value); // Setting e to some value (inclusive) between 0 and 30;
    setZoom(120 - zoomCypher); // Taking FOV into account
    console.log(zoomCypher)
    console.log(zoom)
  }

  const handleFormClick = (e) => {
    setSrcStr(`https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${location}&fov=${zoom}&heading=${rotation}&pitch=0&key=${key}`);
    // console.log(srcStr);
  }

  const [srcStr, setSrcStr] = useState("");

  useEffect(() => {
    setLocation(import.meta.env.VITE_LOCATION);

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPosition(pos);
        },
        () => {
        },
      );
    } else {
      // Browser doesn't support Geolocation
    }
  }, [])

  const handleCenterChanged = (e) => {
    // console.log(e.detail.center);
    setPosition(e.detail.center);
  }

  useEffect(() => {
    setLocation(`${position.lat},${position.lng}`)
  }, [position])
  
  return (
    <>
      <h1>Welcome to Green Grid!</h1>
      {position.lat != 0.0 && position.lng != 0.0 ?
        (
        <><APIProvider apiKey={import.meta.env.VITE_API_KEY}>
          <Map
            style={{width: '35vw', height: '35vh'}}
            defaultCenter={{lat: position.lat, lng: position.lng}}
            onCenterChanged={handleCenterChanged}
            defaultZoom={18}
            gestureHandling={'greedy'}
            disableDefaultUI={false}  
          />
        </APIProvider><br /></>
        ):
        (<>Loading...<br /><br /></>)
      }

      {srcStr.length === 0 ?
      (<></>)
      :
      (<><img src={srcStr} alt='image of a street'/><br /></>)}

      <div>
        <label htmlFor="rotation">Rotation (0° - 360°) </label>
        <input type="number" name="rotation" id="rotation" defaultValue={rotation} max={360} min={0} onChange={(e) => setRotation(e.target.value)}/>
        <br />
        <label htmlFor="zoom">Zoom (0 - 30) </label>
        <input type="number" name="zoom" id="zoom" defaultValue={zoomCypher} max={30} min={0} onChange={handleZoom}/>
        <br />
        <button type="submit" onClick={handleFormClick}>Get Street Image!</button>
      </div>
    </>
  )
}

export default App
