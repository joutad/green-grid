import { useEffect, useState } from 'react'
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import axios from 'axios';
import styled from 'styled-components';
import './App.css'

function App() {

  // const openai = new OpenAI({
  //   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  // });
  const [rawResponse, setRawResponse] = useState("");
  const [analysisMessages, setAnalysisMessages] = useState([""]);
  useEffect(() => {
    if (rawResponse.length > 0) {
      let operation = rawResponse.split(/(.*)/g).filter(el => el.length > 0 && !el.startsWith("\n", 0))
      // console.log(operation);
      operation = operation.filter(el => el !== "STARTLIST" && el !== "ENDLIST")
      // console.log(operation)
      setAnalysisMessages(operation);
      // console.log(analysisMessages)
      // setAnalysisMessage(analysisMessage?.split(/(STARTLIST.*ENDLIST)/));
      // console.log(analysisMessage)
    }
  
  }, [rawResponse])

  const [rawDraft, setRawDraft] = useState("");
  const [formattedDraft, setFormattedDraft] = useState([""]);
  useEffect(() => {
    if (rawDraft.length > 1) {

      let lines = rawDraft.split(/\n/g);
      lines = lines.filter(line => line.length > 0)

      lines[0] = lines[0] + "\n";
      // lines[5] = lines[5] + "";

      setFormattedDraft(lines);
      // console.log(lines)

      // setFormattedDraft(formattedDraft.replace("Dear <representative name>,", "Dear <representative name>,\n\n"));
  
      // console.log(formattedDraft)
  
      // setFormattedDraft(formattedDraft.replace(/\.\s*Sincerely,\s*<Your Name>/, ".\n\nSincerely,\n<Your Name>"));
  
      // console.log(formattedDraft);
    }
  
  }, [rawDraft]);
  

  const key = import.meta.env.VITE_MAPS_API_KEY;
  const dimension_x = 512;
  const dimension_y = 512;
  const [position, setPosition] = useState({lat: 0.0, lng: 0.0});
  const [location, setLocation] = useState("")

  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(120);
  const [zoomCypher, setZoomCypher] = useState(0); // Using two states for zoom so that it's not reactively changing zoom input value during final calculations

  // FOV: higher is less zoomed, lower is more zoomed
  useEffect(() => {
    setZoom(120 - zoomCypher);
  }, [zoomCypher]);

  const handleFormClick = (e) => {
    setSrcStr(`https://maps.googleapis.com/maps/api/streetview?size=${dimension_x}x${dimension_y}&location=${location}&fov=${zoom}&heading=${rotation}&pitch=0&key=${key}`);
    // console.log(srcStr);
  }

  const [srcStr, setSrcStr] = useState("");

  
  const analyzeImage = async (imageUrl) => {
    // console.log(imageUrl)
    if (imageUrl.length > 0) {
      try {
        const response = await axios.post('http://localhost:3000/api/analyze', { imageUrl });
        setRawResponse(response.data.choices[0].message.content);
      } catch (error) {
        console.error(`Error analyzing image ${imageUrl}:`, error);
      }
    }
  };

  const writeDraft = async (imageUrl, text) => {
    
    if (imageUrl.length > 0 && text.length > 0) {
      // console.log(imageUrl);
      // console.log(text);
      try {
        const response = await axios.post('http://localhost:3000/api/writeLetter', { imageUrl, text });
        // console.log(response.data.choices[0].message.content)
        setRawDraft(response.data.choices[0].message.content);
        // console.log(rawDraft.split(/\n/g));
      } catch (error) {
        console.error(`Error writing draft letter ${text}:`, error);
      }
    }
  }

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

      <MapDiv id='mapdiv'>
        {position.lat != 0.0 && position.lng != 0.0 ?
          (
          <MapDiv>
            <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
            <Map
              style={{width: '512px', height: '512px'}}
              defaultCenter={{lat: position.lat, lng: position.lng}}
              onCenterChanged={handleCenterChanged}
              defaultZoom={18}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
            />
            </APIProvider>
          </MapDiv>
          ):
          (<>Loading...<br /><br /></>)
        }
        {srcStr.length === 0 ?
        (<></>)
        :
        (
          <MapDiv>
            <img src={srcStr} alt='image of a street'/>
          </MapDiv>
        )}
      </MapDiv>

      <div>
        <label htmlFor="rotation">Rotation (0° - 360°) </label>
        <input type="number" name="rotation" id="rotation" defaultValue={rotation} max={360} min={0} onChange={(e) => setRotation(e.target.value)} disabled={srcStr.length === 0}/>
        <br />
        <label htmlFor="zoom">Zoom (0 - 30) </label>
        <input type="number" name="zoom" id="zoom" defaultValue={zoomCypher} max={30} min={0} onChange={(e) => setZoomCypher(e.target.value)} disabled={srcStr.length === 0}/>
        <br />
        <button type="submit" onClick={handleFormClick}>Get Street Image!</button>
      </div>
      <button onClick={() => analyzeImage(srcStr)} disabled={srcStr.length === 0}>Get Analysis</button>
      {rawResponse.length > 0 ?
      (<center><ResponseUL>{analysisMessages.map((message, id) => <ResponseLI key={id}>{message}</ResponseLI>)}</ResponseUL></center>)
      :
      (<></>)}

      {analysisMessages.length > 1 ?
        (<><button onClick={() => writeDraft(srcStr, analysisMessages.join("\n"))} disabled={rawResponse.length === 0}>Write a draft letter to your representative</button><br /><br /></>)
        :
        (<></>)
      }

      {rawDraft.length > 0 ?
        (<center><ResponseUL>{formattedDraft.map((line, id) => {
          if (id == 0) {
            return (
              <div key={id}>
                <ResponseLI key={id}>{line}</ResponseLI>
                <br />
              </div>
            )
          }
          else if (id == formattedDraft.length-2) {
            return (
              <div key={id}>
                <br />
                <ResponseLI key={id}>{line}</ResponseLI>
              </div>
            )
          }
          else {
            return (
              <ResponseLI key={id}>{line}</ResponseLI>
            )
          }
        })}</ResponseUL></center>)
        :
        (<></>)}
    </>
  )
}

const MapDiv = styled.div`
  display: inline-flex;
`

const ResponseUL = styled.ul`
  width: 45vw;
  text-align: start;
  line-height: 1.2rem;
  list-style-type: none;
  padding-top: 1rem;
  padding-bottom: 1rem;
`

const ResponseLI = styled.li`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`

export default App
