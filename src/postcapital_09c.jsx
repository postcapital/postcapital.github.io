import { select, color, geoCircle, json, geoGraticule10 } from "d3";
import { geoProjection, geoEqualEarth, geoOrthographic, geoEquirectangularRaw,
  geoNaturalEarth1, geoPath } from 'd3-geo'
import {geoAugustRaw} from 'd3-geo-projection'
import { mesh, feature } from 'topojson'

import { render } from 'preact'
import useFetch from "react-fetch-hook";
import { useEffect, useRef } from 'preact/hooks'
// import './style.css';
const [data, loading] = useFetch(
    "data/countries-50m.json"
)

function DataResource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	)
}


const projection2 = geoAugustRaw()

const GeopethMap = () => {

  useEffect(() => {

    const width = 960
    const height = 960

    const svgRef = useRef()
    const projection = geoEqualEarth()
    const svg = select(svgRef.current)
    console.log('inside:' + loaded)
    //const svg = select("#viewPort").attr("width", width).attr("height", height);
    const pathGenerator = geoPath().projection(projection)

    const countries = feature([data], [data].objects.countries);
    svg.append('path')
      .attr('class', 'sphere')
      .attr('d', pathGenerator({ type: 'Sphere' }))
      .style("fill", color("#eea"))
    
    svg.selectAll('path').data(countries.features)
      .enter().append('path')
      .attr('d', pathGenerator)
      .style("fill", color("#333"))

  return (
        <svg ref={svgRef}>
        </svg>
    )
  })
}


const App = () => {
	return (
    <div class="container">
      <GeopethMap>
      </GeopethMap>
      <div class="resource">
        <section>
          <DataResource
            title="Marriage Rates"
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
	)
}

render(<App />, document.getElementById('app'));


function render2(projection) {
  //const path = geoPath(projection, svg);
  // svg.clearRect(0, 0, width, height);
  //svg.save();
  //svg.beginPath(), path(outline), context.clip(), context.fillStyle = "#fff", context.fillRect(0, 0, width, height);
  //svg.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
  //svg.beginPath(), path(land), svg.fillStyle = "#000", svg.fill();
  //svg.restore();
  //svg.beginPath(), path(outline), context.strokeStyle = "#000", context.stroke();
}

var previousProjection = geoEquirectangularRaw;

function update()  {
  const r0 = previousProjection;
  const r1 = projection;
  if (r0 === r1) return;
  previousProjection = r1;
  const interpolate = interpolateProjection(r0, r1);
  for (let j = 1, m = 45; true; ++j) {
    const t = Math.min(1, ease(j / m));
    render(interpolate(t).rotate([performance.now() / 100, 0]));
    //yield;
  }
}

// update();

const sphere = ({ type: "Sphere" });

function getHeight() {
  const [[x0, y0], [x1, y1]] = geoPath(projection.fitWidth(width, sphere)).bounds(sphere);
  const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
  return dy;
};


function sun() {
  const now = new Date;
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = solar.century(now);
  const longitude = (day - now) / 864e5 * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
}

const night =
  geoCircle()
    .radius(90)
    .center(antipode(sun))
    ();


function interpolateProjection(raw0, raw1) {
  const {scale: scale0, translate: translate0} = fit(raw0);
  const {scale: scale1, translate: translate1} = fit(raw1);
  return t => geoProjection((x, y) => lerp2(raw0(x, y), raw1(x, y), t))
    .scale(lerp1(scale0, scale1, t))
    .translate(lerp2(translate0, translate1, t))
    .precision(0.1);
}

function lerp1(x0, x1, t) {
  return (1 - t) * x0 + t * x1;
}

function lerp2([x0, y0], [x1, y1], t) {
  return [(1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1];
}

function fit(raw) {
  const p = geoProjection(raw).fitExtent([[0.5, 0.5], [width - 0.5, height - 0.5]], outline);
  return {scale: p.scale(), translate: p.translate()};
}

// ease = easeCubicInOut

function antipode(longitude, latitude) { return [longitude + 180, -latitude]; }

function update2() {
 d3.select('svg')
   .selectAll('circle')
   .data([data])
   .join('circle')
   .attr('cy', 50)
   .transition()
   .attr('cx', function(d) {
     return d.x;
   })
   .transition()
   .duration(750)
   .ease(d3.easeBounce)
   .attr('r', function(d) {
     return d.r;
   });
}




