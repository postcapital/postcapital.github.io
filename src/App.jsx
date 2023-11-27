import ChoroplethMap from './ChoroplethMap'
import { render } from 'preact'
import useFetch from "react-fetch-hook";
// import './style.css';
//import "preact/debug";

import { useEffect, useState } from 'preact/hooks'

//const projection2 = geoAugustRaw()
// export default function App() {


const App = () => {
  
  const DataResource = (props) => {
    return (
      <a href={props.href} target="_blank" class="resource">
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </a>
    )
  }
  return (
  <div>
    <ChoroplethMap data={null} />
    <div class="resource">
      <div>
        <section>
          <DataResource
            title="Marriage Rate"
            description="Marriage Rates"
            href="https://ourworldindata.org/marriages-and-divorces"
          />
          <DataResource
            title="CO2 and greenhouse gas emissions"
            description="Carbon Mitigation"
            href="https://ourworldindata.org/co2-and-greenhouse-gas-emissions"
          />
        </section>
      </div>
    </div>
  </div>
	)
}


render(<App />, document.getElementById('app'));


