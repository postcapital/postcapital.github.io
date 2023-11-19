import { select, color, geoCircle, json, geoGraticule10 } from "d3";
import { geoProjection, geoEqualEarth, geoOrthographic, geoEquirectangularRaw,
  geoNaturalEarth1, geoPath } from "d3-geo"
import {geoAugustRaw} from 'd3-geo-projection';
import { mesh, feature } from "topojson";

const width = 960, height = 960;
const projection = geoEqualEarth();
const projection2 = geoAugustRaw();
const svg = select("#viewPort").attr("width", width).attr("height", height);

const pathGenerator = geoPath().projection(projection);

//const world = json('data/countries-50m.json');
// const land = feature(world, world.objects.land)
svg.append('path')
  .attr('class', 'sphere')
  .attr('d', pathGenerator({ type: 'Sphere' }))
  .style("fill", color("steelblue"))

json('data/countries-50m.json')
  .then(data => {
    const countries = feature(data, data.objects.countries);
    //render(land);
    svg.selectAll('path').data(countries.features)
      .enter().append('path')
      .attr('d', pathGenerator)
      .style("fill", color("#113"))
  });



function render(projection) {
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

